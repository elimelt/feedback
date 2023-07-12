import express, { Application, Request, Response } from 'express';
import { forward } from './email';
import cors from 'cors';
import cron from "node-cron";
import config from './config';
import { logData, generateLogsReport, saveData } from './logging';
import { type } from 'os';
import { Log, QueueItem } from './types';


const logsDirectory = "" //not working rn. need to update manually in logging.ts

let webLogs: Log = {name: "web", log: ""};

const app: Application = express();
app.use(express.json());
app.use(cors());

const scheduleLogsReport = () => {
  // Schedule the task to run at the end of each day
  cron.schedule('59 23 * * *', () => {
    const logsReport = generateLogsReport(logsDirectory);
    // TODO: Send the logs report via email or handle it as desired
    // You can use the generated `logsReport` here to send it or perform any other actions
    console.log('Sending logs report...');
  });
}


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

// endpoint for submitting feedback
app.post('/feedback/send', ipQueueMiddleware, async (req: Request, res: Response) => {
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

app.post('/log/write', async(req: Request, res: Response) => {
  const { logName, content, secret } = req.body;

  console.log("body: ", req.body)
  console.log(secret, typeof secret, config.SECRET, typeof config.SECRET)
  if (""+secret !== config.SECRET)
    return res.json({ success: false })
  
  logData(logName, content);
  webLogs = saveData(webLogs, logName, content);

  return res.json({ success: true })
})

app.get('/log', async(req: Request, res: Response) => {
  // res.json(generateLogsReport(logsDirectory));
  res.json(webLogs);
})

app.use((req: Request, res: Response) => {
  res.status(404).send({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
