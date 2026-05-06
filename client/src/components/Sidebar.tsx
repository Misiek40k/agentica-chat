import { useState } from 'react'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Tooltip from '@mui/material/Tooltip'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { alpha } from '@mui/material/styles'
import type { Session } from '../schemas/api.js'

interface SidebarProps {
  sessions: Session[]
  activeSessionId: string
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
  mobileOpen: boolean
  onMobileClose: () => void
  sidebarBg: string
  accent: string
  drawerWidth: number
}

function formatRelative(timestamp: number): string {
  const diff = Date.now() - timestamp
  if (diff < 60_000) return 'just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return `${Math.floor(diff / 86_400_000)}d ago`
}

export function Sidebar({
  sessions,
  activeSessionId,
  onSelect,
  onNew,
  onDelete,
  mobileOpen,
  onMobileClose,
  sidebarBg,
  accent,
  drawerWidth,
}: SidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  function handleDeleteClick(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    setPendingDeleteId(id)
  }

  function handleConfirmDelete() {
    if (pendingDeleteId) onDelete(pendingDeleteId)
    setPendingDeleteId(null)
  }

  const content = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: sidebarBg }}>
      {/* New chat button */}
      <Box sx={{ p: 2, pb: 1.5 }}>
        <Button
          startIcon={<AddIcon />}
          fullWidth
          onClick={onNew}
          sx={{
            justifyContent: 'flex-start',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '8px',
            py: 1,
            px: 1.5,
            color: 'text.primary',
            fontWeight: 500,
            fontSize: '0.875rem',
            textTransform: 'none',
            bgcolor: 'transparent',
            '&:hover': {
              bgcolor: alpha(accent, 0.1),
              borderColor: alpha(accent, 0.3),
            },
          }}
        >
          New chat
        </Button>
      </Box>

      <Divider sx={{ borderColor: 'divider' }} />

      {/* Session list */}
      <List sx={{ flex: 1, overflow: 'auto', py: 1, px: 1 }}>
        {sessions.length === 0 ? (
          <Box sx={{ px: 1, py: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              No conversations yet
            </Typography>
          </Box>
        ) : (
          sessions.map((session) => {
            const isActive = session.id === activeSessionId
            const isHovered = hoveredId === session.id
            return (
              <ListItemButton
                key={session.id}
                onClick={() => onSelect(session.id)}
                onMouseEnter={() => setHoveredId(session.id)}
                onMouseLeave={() => setHoveredId(null)}
                sx={{
                  position: 'relative',
                  borderRadius: '6px',
                  py: '4px',
                  px: 1,
                  pr: isHovered ? '36px' : 1,
                  mb: 0.25,
                  bgcolor: isActive ? alpha(accent, 0.12) : 'transparent',
                  borderLeft: isActive ? `2px solid ${accent}` : '2px solid transparent',
                  transition: 'padding-right 0.15s',
                  '&:hover': {
                    bgcolor: isActive ? alpha(accent, 0.15) : alpha(accent, 0.06),
                  },
                }}
              >
                <ListItemText
                  primary={session.title}
                  secondary={formatRelative(session.createdAt)}
                  slotProps={{
                    primary: {
                      noWrap: true,
                      sx: {
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: isActive ? accent : 'text.primary',
                        lineHeight: 1.4,
                      },
                    },
                    secondary: {
                      sx: {
                        fontSize: '0.75rem',
                        color: 'text.secondary',
                        lineHeight: 1.3,
                      },
                    },
                  }}
                />

                {isHovered && (
                  <Tooltip title="Delete chat" placement="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleDeleteClick(e, session.id)}
                      aria-label="Delete chat"
                      sx={{
                        position: 'absolute',
                        right: 4,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'text.secondary',
                        '&:hover': { color: 'error.main' },
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                )}
              </ListItemButton>
            )
          })
        )}
      </List>

      {/* Confirmation dialog */}
      <Dialog
        open={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        slotProps={{ paper: { sx: { borderRadius: '12px', minWidth: 320 } } }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1rem' }}>Delete chat?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '0.875rem' }}>
            This will permanently remove this conversation. This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setPendingDeleteId(null)}
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: sidebarBg,
            border: 'none',
          },
        }}
      >
        {content}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: sidebarBg,
            border: 'none',
          },
        }}
        open
      >
        {content}
      </Drawer>
    </Box>
  )
}
