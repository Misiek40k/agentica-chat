# agentica-chat

A full-stack streaming chat application built with React, TypeScript, Express, and Server-Sent Events.

## Setup

```bash
cp .env.example .env          # fill in LLM_API_KEY and LLM_BASE_URL
npm install
npm run dev                   # client :5173, server :3001 (hot-reload)
```

## Production

```bash
npm start                     # builds both packages, then serves from :3001
```

## Environment variables

| Variable | Description |
|---|---|
| `LLM_API_KEY` | API key forwarded to the LLM provider |
| `LLM_BASE_URL` | Base URL of an OpenAI-compatible API |
| `PORT` | Server port (default `3001`) |

---

## Discussion

### 1. Why SSE instead of WebSockets for streaming?

SSE is a simpler, HTTP/1.1-native protocol that fits a unidirectional server-to-client stream perfectly. The LLM provider already returns an SSE stream, so the Express server can pipe it directly to the browser with no format conversion. WebSockets would add bidirectional complexity (connection upgrades, heartbeats, reconnect logic) for a use-case that only ever pushes data one way.

### 2. How is client state managed, and why?

State lives in a single `useReducer` inside `ChatProvider`, shared via React Context. Every action (`ADD_MESSAGE`, `APPEND_CHUNK`, `SET_MESSAGE_STATUS`, …) produces a new immutable state snapshot. This makes the data-flow easy to trace: the reducer is a pure function, and the only place state changes. Redux was not needed because there is no cross-cutting middleware requirement; Context + `useReducer` covers the complexity with zero extra dependencies.

### 3. How does localStorage persistence work?

On mount, `ChatProvider` reads `localStorage.getItem("chat-sessions")` and validates the JSON against the `Session` Zod schema (`Session.array().safeParse`). Invalid or missing data falls back to a fresh session, so a corrupted store never breaks the app. On every state change, a 500 ms debounced `useEffect` writes the sessions array back. The debounce prevents a localStorage write on every streamed chunk (which can be dozens per second).

### 4. How is streaming abort / mid-stream cancellation handled?

`useChat` keeps an `AbortController` ref. When `sendMessage` is called while a previous stream is active, it immediately calls `abort()` on the old controller before creating a new one. The old request's `catch` block detects `AbortError` and marks that assistant message as `status: "done"` (preserving whatever partial content arrived). A `streamIdRef` ensures that only the most-recently-started stream's `finally` block calls `setIsStreaming(false)`, preventing a stale cleanup from hiding the new stream's progress indicator.

### 5. How is input validation applied on both sides?

The server uses Zod (`ChatRequestBody`) to validate every incoming request: messages must be a non-empty array (max 100), each with a non-empty string content and a valid role enum. A 400 response with structured error details is returned on failure. On the client, `ChatInput` disables the send button and ignores Enter for whitespace-only input (`!value.trim()`). Incoming SSE chunks are parsed through `SSEChunk.safeParse` and silently skipped if malformed.

### 6. How does retry work?

When an assistant message has `status === "error"`, `MessageBubble` renders a `RefreshIcon` button. Clicking it calls `onRetry(message.id)` which bubbles up to `App.tsx`. `handleRetry` finds the user message immediately preceding the failed assistant message, removes both from the session with two `REMOVE_MESSAGE` dispatches (keeping the history clean), then calls `sendMessage` with the original user content to start a fresh request.

### 7. What would you change for a production deployment?

- **Session storage**: move from `localStorage` to a backend database (e.g. Postgres) so sessions survive device switches and can be shared across tabs without race conditions.
- **Auth**: add JWT-based authentication; currently any client can hit `/api/chat`.
- **Rate limiting**: add per-IP or per-user rate limiting on the Express route to prevent abuse of the LLM API key.
- **Error observability**: structured server-side logging (e.g. Pino) and a frontend error boundary with Sentry.
- **Streaming robustness**: handle network interruptions with exponential-backoff reconnect on the client instead of immediately showing an error.
- **Scalability**: if horizontal scaling is needed, the current SSE approach works fine behind a load balancer with sticky sessions; for stateless scaling, switch to a message queue (e.g. Redis Streams) between the API and SSE emitters.
