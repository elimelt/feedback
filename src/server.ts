import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app: Application = express();

app.use(bodyParser.json());
app.use(cors());

app.post('/feedback', (req: Request, res: Response) => {
  const { name, email, message } = req.body;

  console.log(`New feedback submission received: ${message}`);

  // Send a response back to the client
  res.json({ success: true });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
