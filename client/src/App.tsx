import { useState, useMemo } from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { Sidebar } from './components/Sidebar.js'
import { MessageList } from './components/MessageList.js'
import { ChatInput } from './components/ChatInput.js'
import { useChatContext } from './context/ChatContext.js'
import { makeSession } from './context/ChatProvider.js'
import { useActiveSession } from './hooks/useActiveSession.js'
import { useChat } from './hooks/useChat.js'

function ChatLayout() {
  const { sessions, activeSessionId, dispatch } = useChatContext()
  const activeSession = useActiveSession()
  const { sendMessage, cancelStream, isStreaming } = useChat()

  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('agentica-theme')
    return saved === 'dark' ? 'dark' : 'light'
  })

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode])

  function toggleTheme() {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem('agentica-theme', next)
      return next
    })
  }

  function handleNew() {
    dispatch({ type: 'NEW_SESSION', payload: makeSession() })
  }

  function handleSelect(id: string) {
    dispatch({ type: 'SELECT_SESSION', payload: id })
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelect={handleSelect}
          onNew={handleNew}
        />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              px: 1,
              py: 0.5,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <IconButton onClick={toggleTheme} size="small" aria-label="Toggle theme">
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Box>
          <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <MessageList messages={activeSession?.messages ?? []} />
          </Box>
          <ChatInput onSend={sendMessage} onStop={cancelStream} isStreaming={isStreaming} />
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default ChatLayout
