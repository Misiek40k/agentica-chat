import { Router, Request, Response, NextFunction } from 'express'
import { Readable } from 'node:stream'
import { ChatRequestBody } from '../schemas/request.js'

export const chatRouter = Router()

chatRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = ChatRequestBody.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: parsed.error.errors })
      return
    }

    const body = parsed.data
    const apiKey = process.env.LLM_API_KEY
    const baseUrl = process.env.LLM_BASE_URL

    if (!apiKey || !baseUrl) {
      const err = Object.assign(new Error('LLM environment variables not configured'), { statusCode: 500, code: 'MISSING_CONFIG' })
      throw err
    }

    const llmResponse = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: body.model ?? 'gpt-3.5-turbo',
        messages: body.messages,
        stream: true,
      }),
    })

    if (!llmResponse.ok) {
      const errorText = await llmResponse.text()
      res.status(502).json({ error: errorText, code: 'LLM_ERROR' })
      return
    }

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    const nodeStream = Readable.fromWeb(llmResponse.body as Parameters<typeof Readable.fromWeb>[0])
    nodeStream.pipe(res)

    req.on('close', () => nodeStream.destroy())
  } catch (err) {
    next(err)
  }
})
