import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import RefreshIcon from '@mui/icons-material/Refresh'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useTheme } from '@mui/material/styles'
import type { Message } from '../schemas/api.js'

const cursorSx = {
  '@keyframes blink': {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0 },
  },
  animation: 'blink 1s step-end infinite',
  display: 'inline-block',
  width: '2px',
  height: '14px',
  borderRadius: '1px',
  verticalAlign: 'middle',
  ml: '2px',
} as const

interface MessageBubbleProps {
  message: Message
  onRetry?: (id: string) => void
  elevated: string
  accent: string
}

export function MessageBubble({ message, onRetry, elevated, accent }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const codeBlockBg = isDark ? '#1e1e2e' : '#f4f4f5'
  const inlineCodeBg = isDark ? 'rgba(30,30,46,0.6)' : 'rgba(244,244,245,0.8)'
  const linkColor = accent

  const markdownComponents = {
    pre: ({ children }: React.ComponentProps<'pre'>) => (
      <Box
        component="pre"
        sx={{
          bgcolor: codeBlockBg,
          p: 2,
          borderRadius: '8px',
          overflow: 'auto',
          my: 1,
          fontFamily: '"JetBrains Mono", "Fira Code", monospace',
          fontSize: '13px',
          lineHeight: 1.6,
          '& code': { bgcolor: 'transparent', p: 0, fontSize: 'inherit' },
        }}
      >
        {children}
      </Box>
    ),
    code: ({ children }: React.ComponentProps<'code'>) => (
      <Box
        component="code"
        sx={{
          bgcolor: inlineCodeBg,
          px: '6px',
          py: '2px',
          borderRadius: '4px',
          fontFamily: '"JetBrains Mono", "Fira Code", monospace',
          fontSize: '0.85em',
        }}
      >
        {children}
      </Box>
    ),
    a: ({ href, children }: React.ComponentProps<'a'>) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: linkColor,
          textDecoration: 'none',
        }}
        onMouseEnter={(e) => ((e.target as HTMLElement).style.textDecoration = 'underline')}
        onMouseLeave={(e) => ((e.target as HTMLElement).style.textDecoration = 'none')}
      >
        {children}
      </a>
    ),
  }

  if (isUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3, px: 2 }}>
        <Box
          sx={{
            maxWidth: { xs: '90%', md: '60%' },
            bgcolor: accent,
            color: '#fff',
            borderRadius: '20px 20px 4px 20px',
            px: 2,
            py: 1.5,
          }}
        >
          <Typography
            variant="body2"
            sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6 }}
          >
            {message.content}
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 3, px: 2 }}>
      {/* Assistant icon */}
      <Box sx={{ flexShrink: 0, mt: '12px' }}>
        <AutoAwesomeIcon sx={{ fontSize: 20, color: accent }} />
      </Box>

      {/* Bubble */}
      <Box
        sx={{
          maxWidth: { xs: '90%', md: '75%' },
          bgcolor: elevated,
          borderRadius: '20px 20px 20px 4px',
          px: 2,
          py: 1.5,
        }}
      >
        {message.status === 'error' ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <WarningAmberIcon fontSize="small" sx={{ color: 'error.main', flexShrink: 0 }} />
            <Typography variant="body2" sx={{ color: 'error.main' }}>
              Failed to generate a response
            </Typography>
            {onRetry && (
              <IconButton
                size="small"
                onClick={() => onRetry(message.id)}
                aria-label="Retry"
                sx={{ ml: 0.5, color: 'text.secondary' }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              '& p': { m: 0, mb: 0.75, lineHeight: 1.7 },
              '& p:last-child': { mb: 0 },
              '& ul, & ol': { pl: 2.5, my: 0.5 },
              '& li': { mb: 0.25, lineHeight: 1.7 },
              '& h1,h2,h3,h4': { mt: 1.5, mb: 0.5, fontWeight: 600 },
              fontSize: '0.875rem',
              wordBreak: 'break-word',
              color: 'text.primary',
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {message.content}
            </ReactMarkdown>
            {message.status === 'streaming' && (
              <Box
                component="span"
                sx={{ ...cursorSx, bgcolor: accent }}
              />
            )}
          </Box>
        )}
      </Box>
    </Box>
  )
}
