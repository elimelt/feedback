import express, { Application, Request, Response } from 'express';
import { forward } from './email';
import cors from 'cors';
import { config } from 'dotenv';

interface QueueItem {
  ip: string;
  timestamp: number;
}

const app: Application = express();
app.use(express.json());
app.use(cors());

const queueReset: number = 600000*60

const ipQueue: QueueItem[] = [];

// middleware to check the IP address queue
const ipQueueMiddleware = (req: Request, res: Response, next: any) => {
  const ip = req.ip;
  const now = Date.now();
  const ipIndex = ipQueue.findIndex((item) => item.ip === ip);
  for (let qi of ipQueue) console.log('middleware: ', qi.ip)
  if (ipIndex !== -1) {
    const lastRequestTime = ipQueue[ipIndex].timestamp;
    if (now - lastRequestTime < queueReset) {
      return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }
    ipQueue.splice(ipIndex, 1);
  }

  ipQueue.push({ ip, timestamp: now });
  next();
};

// remove IP addresses from the queue after 10 minutes
setInterval(() => {
  const now = Date.now();
  while (ipQueue.length > 0 && now - ipQueue[0].timestamp >= queueReset) {
    ipQueue.shift();
  }
}, 60000); // run every 10 min to remove expired IP addresses

app.use(ipQueueMiddleware);

// endpoint for submitting feedback
app.post('/feedback/send', async (req: Request, res: Response) => {
  const { name, email, feedback, secret } = req.body;
  for (let qi of ipQueue) console.log('in req: ', qi.ip)
  console.log(req.body);
  try {
    const result = await forward(name, email, feedback, secret);
    return res.json({ success: result.success });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
