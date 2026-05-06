import { z } from 'zod'

export const ChatRequestBody = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().min(1),
      }),
    )
    .min(1)
    .max(100),
  model: z.string().optional(),
})
export type ChatRequestBody = z.infer<typeof ChatRequestBody>
