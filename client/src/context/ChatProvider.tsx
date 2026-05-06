import { useReducer, useMemo, type ReactNode } from 'react'
import { nanoid } from 'nanoid'
import { ChatContext, type ChatAction } from './ChatContext.js'
import type { Session } from '../schemas/api.js'

type ChatState = {
  sessions: Session[]
  activeSessionId: string
}

function makeSession(): Session {
  return { id: nanoid(), title: 'New chat', messages: [], createdAt: Date.now() }
}

const initialSession = makeSession()
const initialState: ChatState = {
  sessions: [initialSession],
  activeSessionId: initialSession.id,
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_MESSAGE': {
      const target = state.sessions.find((s) => s.id === state.activeSessionId)
      const isFirstUser =
        action.payload.role === 'user' &&
        !target?.messages.some((m) => m.role === 'user')
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id !== state.activeSessionId
            ? s
            : {
                ...s,
                title: isFirstUser ? action.payload.content.slice(0, 40) : s.title,
                messages: [...s.messages, action.payload],
              },
        ),
      }
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
    default:
      return state
  }
}

export { makeSession }

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState)

  const activeSession = useMemo(
    () => state.sessions.find((s) => s.id === state.activeSessionId) ?? null,
    [state.sessions, state.activeSessionId],
  )

  const value = useMemo(
    () => ({ sessions: state.sessions, activeSessionId: state.activeSessionId, activeSession, dispatch }),
    [state.sessions, state.activeSessionId, activeSession],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
