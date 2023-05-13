import express, { Application, Request, Response } from 'express'
import { forward } from './email'
import cors from 'cors'
import { config } from 'dotenv'

const app: Application = express()

app.use(express.json())
app.use(cors())

app.post('/feedback/send', async (req: Request, res: Response) => {
  const { name, email, feedback, secret } = req.body;

  

  console.log(req)
  try {
    await forward(name, email, feedback, secret)
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, error: error })
  }
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
