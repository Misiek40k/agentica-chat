import { useChatContext } from '../context/ChatContext.js'

export function useActiveSession() {
  return useChatContext().activeSession
}
