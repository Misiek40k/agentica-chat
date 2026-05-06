import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { MessageBubble } from './MessageBubble.js'
import { useAutoScroll } from '../hooks/useAutoScroll.js'
import type { Message } from '../schemas/api.js'

interface MessageListProps {
  messages: Message[]
  onRetry?: (id: string) => void
}

export function MessageList({ messages, onRetry }: MessageListProps) {
  const { scrollRef } = useAutoScroll(messages.length)

  return (
    <Box
      ref={scrollRef as React.RefObject<HTMLDivElement>}
      sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}
    >
      {messages.length === 0 ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="text.secondary">Send a message to start</Typography>
        </Box>
      ) : (
        <Box sx={{ py: 2 }}>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} onRetry={onRetry} />
          ))}
        </Box>
      )}
    </Box>
  )
}
