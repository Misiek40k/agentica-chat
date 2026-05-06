import { useState, useRef } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import SendIcon from '@mui/icons-material/Send'
import StopIcon from '@mui/icons-material/Stop'
import { alpha } from '@mui/material/styles'

interface ChatInputProps {
  onSend: (content: string) => void
  onStop: () => void
  isStreaming: boolean
  elevated: string
  accent: string
}

export function ChatInput({ onSend, onStop, isStreaming, elevated, accent }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSend() {
    if (!value.trim() || isStreaming) return
    onSend(value.trim())
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleInput(e: React.FormEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
    setValue(el.value)
  }

  const canSend = value.trim().length > 0 && !isStreaming

  return (
    <Box
      sx={{
        borderTop: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(8px)',
        bgcolor: 'background.default',
        flexShrink: 0,
      }}
    >
      {/* Streaming progress bar */}
      {isStreaming && (
        <LinearProgress
          sx={{
            height: '2px',
            '& .MuiLinearProgress-bar': { bgcolor: accent },
            bgcolor: alpha(accent, 0.15),
          }}
        />
      )}

      <Box
        sx={{
          maxWidth: 720,
          mx: 'auto',
          px: 2,
          py: 1.5,
        }}
      >
        {/* Input wrapper */}
        <Box sx={{ position: 'relative' }}>
          <Box
            component="textarea"
            ref={textareaRef}
            value={value}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            rows={1}
            sx={{
              width: '100%',
              resize: 'none',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '12px',
              bgcolor: elevated,
              color: 'text.primary',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              p: '12px 52px 12px 16px',
              outline: 'none',
              overflow: 'hidden',
              display: 'block',
              transition: 'border-color 0.15s',
              '&::placeholder': { color: 'text.secondary', opacity: 1 },
              '&:focus': { borderColor: accent },
            }}
          />

          {/* Action button inside input */}
          <Box
            sx={{
              position: 'absolute',
              right: 8,
              bottom: 8,
            }}
          >
            {isStreaming ? (
              <IconButton
                size="small"
                onClick={onStop}
                aria-label="Stop generating"
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: '#ef4444',
                  color: '#fff',
                  '&:hover': { bgcolor: '#dc2626' },
                }}
              >
                <StopIcon sx={{ fontSize: 16 }} />
              </IconButton>
            ) : (
              <IconButton
                size="small"
                onClick={handleSend}
                disabled={!canSend}
                aria-label="Send message"
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: accent,
                  color: '#fff',
                  opacity: canSend ? 1 : 0.3,
                  '&:hover': { bgcolor: canSend ? '#4f51e0' : accent },
                  '&.Mui-disabled': { bgcolor: accent, color: '#fff' },
                }}
              >
                <SendIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Helper text */}
        <Typography
          variant="caption"
          sx={{ display: 'block', mt: 0.75, color: 'text.secondary', fontSize: '10px', pl: 0.5 }}
        >
          Shift+Enter for new line
        </Typography>
      </Box>
    </Box>
  )
}
