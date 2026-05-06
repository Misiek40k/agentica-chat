import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import RefreshIcon from '@mui/icons-material/Refresh'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Message } from '../schemas/api.js'

const blinkSx = {
  '@keyframes blink': {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0 },
  },
  animation: 'blink 1s step-end infinite',
  display: 'inline-block',
  ml: '1px',
  lineHeight: 1,
  userSelect: 'none',
} as const

const markdownComponents = {
  pre: ({ children }: React.ComponentProps<'pre'>) => (
    <Box
      component="pre"
      sx={{
        bgcolor: 'action.hover',
        p: 1.5,
        borderRadius: 1,
        overflow: 'auto',
        my: 1,
        fontFamily: 'monospace',
        fontSize: '0.875em',
        '& code': { bgcolor: 'transparent', p: 0 },
      }}
    >
      {children}
    </Box>
  ),
  code: ({ children }: React.ComponentProps<'code'>) => (
    <Box
      component="code"
      sx={{
        bgcolor: 'action.hover',
        px: 0.5,
        py: 0.25,
        borderRadius: 0.5,
        fontFamily: 'monospace',
        fontSize: '0.875em',
      }}
    >
      {children}
    </Box>
  ),
  a: ({ href, children }: React.ComponentProps<'a'>) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
}

interface MessageBubbleProps {
  message: Message
  onRetry?: (id: string) => void
}

export function MessageBubble({ message, onRetry }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 1,
        px: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: isUser ? '70%' : '80%',
          bgcolor: isUser ? 'primary.main' : 'background.paper',
          color: isUser ? 'primary.contrastText' : 'text.primary',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          px: 2,
          py: 1.5,
          boxShadow: 1,
        }}
      >
        {message.status === 'error' ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <WarningAmberIcon fontSize="small" sx={{ color: 'error.main' }} />
            <Typography variant="body2" sx={{ color: 'error.main' }}>
              Failed to generate a response
            </Typography>
            {onRetry && (
              <IconButton
                size="small"
                onClick={() => onRetry(message.id)}
                aria-label="Retry"
                sx={{ ml: 0.5 }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        ) : isUser ? (
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {message.content}
          </Typography>
        ) : (
          <Box
            sx={{
              '& p': { m: 0, mb: 0.5 },
              '& p:last-child': { mb: 0 },
              '& ul, & ol': { pl: 2, my: 0.5 },
              '& li': { mb: 0.25 },
              wordBreak: 'break-word',
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {message.content}
            </ReactMarkdown>
            {message.status === 'streaming' && (
              <Box component="span" sx={blinkSx}>
                |
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  )
}
