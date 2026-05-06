import { useRef, useState } from 'react'
import { nanoid } from 'nanoid'
import { SSEChunk, type Message } from '../schemas/api.js'
import { useChatContext } from '../context/ChatContext.js'

export function useChat() {
  const { dispatch, activeSession } = useChatContext()
  const abortControllerRef = useRef<AbortController | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)

  async function sendMessage(content: string) {
    if (!content.trim()) return

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    const userMessage: Message = {
      id: nanoid(),
      role: 'user',
      content: content.trim(),
      status: 'done',
    }
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage })

    const assistantId = nanoid()
    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      status: 'streaming',
    }
    dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage })

    setIsStreaming(true)

    try {
      const existingMessages = (activeSession?.messages ?? []).map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...existingMessages, { role: userMessage.role, content: userMessage.content }],
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        dispatch({ type: 'SET_MESSAGE_STATUS', payload: { id: assistantId, status: 'error' } })
        return
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value, { stream: true })
        for (const line of text.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const parsed = SSEChunk.safeParse(JSON.parse(data))
            if (!parsed.success) {
              console.warn('Invalid SSE chunk:', data)
              continue
            }
            const delta = parsed.data.choices[0]?.delta.content
            if (delta) {
              dispatch({ type: 'APPEND_CHUNK', payload: { id: assistantId, content: delta } })
            }
          } catch {
            console.warn('Failed to parse SSE data:', data)
          }
        }
      }

      dispatch({ type: 'SET_MESSAGE_STATUS', payload: { id: assistantId, status: 'done' } })
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        dispatch({ type: 'SET_MESSAGE_STATUS', payload: { id: assistantId, status: 'done' } })
      } else {
        dispatch({ type: 'SET_MESSAGE_STATUS', payload: { id: assistantId, status: 'error' } })
      }
    } finally {
      setIsStreaming(false)
    }
  }

  function cancelStream() {
    abortControllerRef.current?.abort()
  }

  return { sendMessage, cancelStream, isStreaming }
}
