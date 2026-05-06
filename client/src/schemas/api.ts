import { z } from 'zod'

export const MessageRole = z.enum(['user', 'assistant', 'system'])
export type MessageRole = z.infer<typeof MessageRole>

export const Message = z.object({
  id: z.string(),
  role: MessageRole,
  content: z.string(),
  status: z.enum(['done', 'streaming', 'error']).default('done'),
})
export type Message = z.infer<typeof Message>

export const Session = z.object({
  id: z.string(),
  title: z.string(),
  messages: z.array(Message),
  createdAt: z.number(),
})
export type Session = z.infer<typeof Session>

export const SSEChunk = z.object({
  id: z.string().optional(),
  choices: z.array(
    z.object({
      delta: z.object({
        content: z.string().optional(),
      }),
      finish_reason: z.string().nullable().optional(),
    }),
  ),
})
export type SSEChunk = z.infer<typeof SSEChunk>

export const ChatRequest = z.object({
  messages: z
    .array(
      z.object({
        role: MessageRole,
        content: z.string().min(1),
      }),
    )
    .min(1),
})
export type ChatRequest = z.infer<typeof ChatRequest>
