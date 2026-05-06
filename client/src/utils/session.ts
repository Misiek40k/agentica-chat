import { nanoid } from 'nanoid'
import type { Session } from '../schemas/api.js'

export function makeSession(): Session {
  return { id: nanoid(), title: 'New chat', messages: [], createdAt: Date.now() }
}
