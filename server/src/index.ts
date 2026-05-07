import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import { chatRouter } from './routes/chat.js'

const app = express()
const port = process.env.PORT ?? 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/chat', chatRouter)

const clientDist = path.resolve(__dirname, '../../client/dist')
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)
  const status = (err as Error & { statusCode?: number }).statusCode ?? 500
  const code = (err as Error & { code?: string }).code ?? 'INTERNAL_SERVER_ERROR'
  res.status(status).json({ error: err.message, code })
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
