import { useState, useMemo } from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Sidebar } from './components/Sidebar.js'
import { MessageList } from './components/MessageList.js'
import { ChatInput } from './components/ChatInput.js'
import { useChatContext } from './context/ChatContext.js'
import { makeSession } from './utils/session.js'
import { useActiveSession } from './hooks/useActiveSession.js'
import { useChat } from './hooks/useChat.js'

const ACCENT = '#6366f1'
const DRAWER_WIDTH = 260

function buildTheme(mode: 'light' | 'dark') {
  const isDark = mode === 'dark'
  return createTheme({
    palette: {
      mode,
      primary: { main: ACCENT },
      background: {
        default: isDark ? '#0a0a0a' : '#ffffff',
        paper: isDark ? '#111111' : '#f5f5f5',
      },
      divider: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
      text: {
        primary: isDark ? '#f0f0f0' : '#111111',
        secondary: isDark ? 'rgba(240,240,240,0.5)' : 'rgba(0,0,0,0.45)',
      },
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: 'Inter, sans-serif',
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*': { boxSizing: 'border-box' },
          'html, body, #root': { height: '100%' },
          '::-webkit-scrollbar': { width: '6px' },
          '::-webkit-scrollbar-track': { background: 'transparent' },
          '::-webkit-scrollbar-thumb': {
            background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)',
            borderRadius: '3px',
          },
        },
      },
    },
  })
}

function ChatLayout() {
  const { sessions, activeSessionId, dispatch } = useChatContext()
  const activeSession = useActiveSession()
  const { sendMessage, cancelStream, isStreaming } = useChat()

  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('agentica-theme')
    return saved === 'light' ? 'light' : 'dark'
  })
  const [mobileOpen, setMobileOpen] = useState(false)

  const theme = useMemo(() => buildTheme(mode), [mode])
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  function toggleTheme() {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem('agentica-theme', next)
      return next
    })
  }

  function handleNew() {
    dispatch({ type: 'NEW_SESSION', payload: makeSession() })
    setMobileOpen(false)
  }

  function handleSelect(id: string) {
    dispatch({ type: 'SELECT_SESSION', payload: id })
    setMobileOpen(false)
  }

  function handleRetry(failedAssistantId: string) {
    const messages = activeSession?.messages ?? []
    const idx = messages.findIndex((m) => m.id === failedAssistantId)
    if (idx <= 0) return
    const preceding = messages[idx - 1]
    if (preceding?.role !== 'user') return
    dispatch({ type: 'REMOVE_MESSAGE', payload: { id: failedAssistantId } })
    dispatch({ type: 'REMOVE_MESSAGE', payload: { id: preceding.id } })
    sendMessage(preceding.content)
  }

  const isDark = mode === 'dark'
  const sidebarBg = isDark ? '#0d0d0d' : '#f0f0f0'
  const elevated = isDark ? '#1a1a1a' : '#ebebeb'

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelect={handleSelect}
          onNew={handleNew}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          sidebarBg={sidebarBg}
          accent={ACCENT}
          drawerWidth={DRAWER_WIDTH}
        />

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minWidth: 0,
            borderLeft: `1px solid ${theme.palette.divider}`,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              height: 48,
              display: 'flex',
              alignItems: 'center',
              px: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
              flexShrink: 0,
              position: 'relative',
            }}
          >
            {isMobile && (
              <IconButton
                size="small"
                onClick={() => setMobileOpen(true)}
                aria-label="Open sidebar"
                sx={{ mr: 1 }}
              >
                <MenuIcon fontSize="small" />
              </IconButton>
            )}
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                maxWidth: '60%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: 'text.primary',
              }}
            >
              {activeSession?.title ?? 'New chat'}
            </Typography>
            <IconButton
              size="small"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              sx={{ ml: 'auto' }}
            >
              {mode === 'dark' ? (
                <LightModeIcon fontSize="small" />
              ) : (
                <DarkModeIcon fontSize="small" />
              )}
            </IconButton>
          </Box>

          {/* Messages */}
          <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <MessageList
              messages={activeSession?.messages ?? []}
              onRetry={handleRetry}
              elevated={elevated}
              accent={ACCENT}
            />
          </Box>

          {/* Input */}
          <ChatInput
            onSend={sendMessage}
            onStop={cancelStream}
            isStreaming={isStreaming}
            elevated={elevated}
            accent={ACCENT}
          />
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default ChatLayout
