import { createContext, useContext, type Dispatch } from 'react'
import type { Message, Session } from '../schemas/api.js'

export type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_MESSAGE_STATUS'; payload: { id: string; status: Message['status'] } }
  | { type: 'APPEND_CHUNK'; payload: { id: string; content: string } }
  | { type: 'SELECT_SESSION'; payload: string }
  | { type: 'NEW_SESSION'; payload: Session }
  | { type: 'UPDATE_SESSION_TITLE'; payload: { id: string; title: string } }
  | { type: 'REMOVE_MESSAGE'; payload: { id: string } }
  | { type: 'DELETE_SESSION'; payload: { id: string } }

type ChatContextValue = {
  sessions: Session[]
  activeSessionId: string
  activeSession: Session | null
  dispatch: Dispatch<ChatAction>
}

export const ChatContext = createContext<ChatContextValue | null>(null)

export function useChatContext(): ChatContextValue {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChatContext must be used within ChatProvider')
  return ctx
}
