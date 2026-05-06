import { useReducer, useMemo, useEffect, type ReactNode } from 'react'
import { ChatContext, type ChatAction } from './ChatContext.js'
import { Session } from '../schemas/api.js'
import type { Session as SessionType } from '../schemas/api.js'
import { makeSession } from '../utils/session.js'

type ChatState = {
  sessions: SessionType[]
  activeSessionId: string
}

function loadInitialState(): ChatState {
  try {
    const raw = localStorage.getItem('chat-sessions')
    if (raw) {
      const parsed = Session.array().safeParse(JSON.parse(raw))
      if (parsed.success && parsed.data.length > 0) {
        return { sessions: parsed.data, activeSessionId: parsed.data[0].id }
      }
    }
  } catch {
    // fall through to default
  }
  const initial = makeSession()
  return { sessions: [initial], activeSessionId: initial.id }
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id !== state.activeSessionId
            ? s
            : { ...s, messages: [...s.messages, action.payload] },
        ),
      }

    case 'UPDATE_SESSION_TITLE':
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id !== action.payload.id ? s : { ...s, title: action.payload.title },
        ),
      }

    case 'REMOVE_MESSAGE':
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id !== state.activeSessionId
            ? s
            : { ...s, messages: s.messages.filter((m) => m.id !== action.payload.id) },
        ),
      }

    case 'SET_MESSAGE_STATUS':
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id !== state.activeSessionId
            ? s
            : {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === action.payload.id ? { ...m, status: action.payload.status } : m,
                ),
              },
        ),
      }

    case 'APPEND_CHUNK':
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id !== state.activeSessionId
            ? s
            : {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === action.payload.id
                    ? { ...m, content: m.content + action.payload.content }
                    : m,
                ),
              },
        ),
      }

    case 'SELECT_SESSION':
      return { ...state, activeSessionId: action.payload }

    case 'NEW_SESSION':
      return {
        sessions: [action.payload, ...state.sessions],
        activeSessionId: action.payload.id,
      }

    case 'DELETE_SESSION': {
      const remaining = state.sessions.filter((s) => s.id !== action.payload.id)
      if (remaining.length === 0) {
        const fresh = makeSession()
        return { sessions: [fresh], activeSessionId: fresh.id }
      }
      if (state.activeSessionId !== action.payload.id) {
        return { ...state, sessions: remaining }
      }
      const idx = state.sessions.findIndex((s) => s.id === action.payload.id)
      const next = remaining[idx] ?? remaining[idx - 1]
      return { sessions: remaining, activeSessionId: next.id }
    }

    default:
      return state
  }
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, undefined, loadInitialState)

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('chat-sessions', JSON.stringify(state.sessions))
    }, 500)
    return () => clearTimeout(timer)
  }, [state.sessions])

  const activeSession = useMemo(
    () => state.sessions.find((s) => s.id === state.activeSessionId) ?? null,
    [state.sessions, state.activeSessionId],
  )

  const value = useMemo(
    () => ({
      sessions: state.sessions,
      activeSessionId: state.activeSessionId,
      activeSession,
      dispatch,
    }),
    [state.sessions, state.activeSessionId, activeSession],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
