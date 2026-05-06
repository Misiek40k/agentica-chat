import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import { MessageBubble } from './MessageBubble.js'
import { useAutoScroll } from '../hooks/useAutoScroll.js'
import type { Message } from '../schemas/api.js'

interface MessageListProps {
  messages: Message[]
  onRetry?: (id: string) => void
  elevated: string
  accent: string
}

export function MessageList({ messages, onRetry, elevated, accent }: MessageListProps) {
  const { scrollRef } = useAutoScroll(messages.length)

  return (
    <Box
      ref={scrollRef as React.RefObject<HTMLDivElement>}
      sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}
    >
      {messages.length === 0 ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            px: 2,
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 48, color: accent, opacity: 0.9 }} />
          <Typography variant="h6" sx={{ fontWeight: 500, color: 'text.primary' }}>
            How can I help you today?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start a conversation below
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            maxWidth: 720,
            width: '100%',
            mx: 'auto',
            py: 3,
          }}
        >
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onRetry={onRetry}
              elevated={elevated}
              accent={accent}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}
