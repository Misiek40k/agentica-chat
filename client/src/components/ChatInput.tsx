import { useState } from 'react'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import SendIcon from '@mui/icons-material/Send'
import StopIcon from '@mui/icons-material/Stop'

interface ChatInputProps {
  onSend: (content: string) => void
  onStop: () => void
  isStreaming: boolean
}

export function ChatInput({ onSend, onStop, isStreaming }: ChatInputProps) {
  const [value, setValue] = useState('')

  function handleSend() {
    if (!value.trim() || isStreaming) return
    onSend(value.trim())
    setValue('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
      {isStreaming && <LinearProgress />}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', p: 2 }}>
        <TextField
          multiline
          maxRows={4}
          fullWidth
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message..."
          size="small"
          variant="outlined"
        />
        {isStreaming ? (
          <IconButton onClick={onStop} color="error" aria-label="Stop generating">
            <StopIcon />
          </IconButton>
        ) : (
          <IconButton
            onClick={handleSend}
            disabled={!value.trim()}
            color="primary"
            aria-label="Send message"
          >
            <SendIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  )
}
