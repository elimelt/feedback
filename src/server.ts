import express, { Application, Request, Response } from 'express';
import { forward } from './email';
import cors from 'cors';
import cron from "node-cron";
import config from './config';
import { generateLogsReport, saveData } from './logging';
import { type } from 'os';
import { Log, QueueItem, LogEntry } from './types';


const logsDirectory = "" //not working rn. need to update manually in logging.ts

let logs: Array<Log> = [{name: "web", log:[]}]

const app: Application = express();
app.use(express.json());
app.use(cors());

const scheduleLogsReport = () => {
  // Schedule the task to run at the end of each day
  cron.schedule('59 23 * * *', () => {
    const logsReport = JSON.stringify(generateLogsReport(logs), null, 4);
    
    console.log('Sending logs report...');

    const res = forward("logger", "logger@gmail.com", logsReport, config.SECRET).then(res => {
      console.log("report forwarding result: " + res)
      return res
    });
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
  const { logName, content, secret } = JSON.parse(JSON.stringify(req.body));

  
  console.log("body: ", req.body)
  
  console.log(secret, typeof secret, config.SECRET, typeof config.SECRET)
  
  if (""+secret !== config.SECRET)
    return res.json({ success: false })
  
  let written = false

  logs = logs.map(log => {
    if (log.name === logName) {
      written = true
      return saveData(log, content)
    } else {
      return log
    }
  });

  if (!written)
    logs = [...logs, {name: logName, log: [content]}]

  return res.json({ success: true })
})

app.get('/log', async(req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.json(JSON.parse(JSON.stringify(generateLogsReport(logs))));
})

app.use((req: Request, res: Response) => {
  res.status(404).send({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  scheduleLogsReport();
  console.log('reporting scheduled')
});
