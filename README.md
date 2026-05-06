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

| Variable       | Description                           |
| -------------- | ------------------------------------- |
| `LLM_API_KEY`  | API key forwarded to the LLM provider |
| `LLM_BASE_URL` | Base URL of an OpenAI-compatible API  |
| `PORT`         | Server port (default `3001`)          |

---

## Discussion Questions

### 1. AI Dev Stack
**Claude.ai (claude.ai)** — used for architecture planning before writing any code.
I used it to design the full-stack structure, decide on state management (useReducer +
Context over Zustand), define Zod schema boundaries, and generate ordered implementation
prompts for each layer of the app.

**Claude Code (terminal)** — used to execute the implementation prompt by prompt,
with `tsc --noEmit` checks between each step to catch issues early.

Both tools run **Claude Sonnet** as the underlying model. The split was intentional:
Claude.ai for thinking and back-and-forth planning, Claude Code for direct file system
execution. No code was written manually.

---

### 2. API discovery
The assignment brief provided the base URL and confirmed it was an OpenAI-compatible
API. To find the model name I sent a plain `curl` to the models endpoint:

```bash
curl https://llm-test-api.projects.agentica.studio/v1/models \
  -H "Authorization: Bearer agentica-test-API"
```

This returned a list of available model IDs. I picked the first listed model and
confirmed it responded correctly by sending a minimal non-streaming chat completion
request before wiring it into the app. If the models endpoint had been unavailable,
the fallback would have been trying common OpenAI model names (`gpt-3.5-turbo`,
`gpt-4`) until one returned a 200.

---

### 3. Architecture
I called the API **through a backend proxy** (Express), not directly from the browser.

**Why:** The API key would be fully visible in browser devtools network tab and in the
client bundle if called directly from the frontend. Even for a test assignment that is
a bad habit to normalise.

**What I'd change in production:**
- Store the API key in a secrets manager (AWS Secrets Manager, Doppler) rather than
  a `.env` file
- Add authentication to the proxy so only logged-in users can hit `/api/chat`
- Add per-user rate limiting (`express-rate-limit`) to prevent abuse
- Stream through an edge runtime (Cloudflare Workers, Vercel Edge Functions) instead
  of a long-lived Express server for better latency and scalability
- Add request logging and tracing headers to correlate client requests with upstream
  LLM calls for debugging

---

### 4. Streaming implementation
I used the **native browser `fetch` + `ReadableStream` API** with no additional
library.

The approach:
1. `fetch('/api/chat')` returns a response whose `.body` is a `ReadableStream`
2. Attach a `TextDecoder` reader and loop with `reader.read()`
3. Split decoded text on `\n`, filter lines starting with `data: `
4. Skip the `data: [DONE]` sentinel
5. `JSON.parse()` the remainder and validate with `SSEChunk.safeParse()` (Zod)
6. Pull `choices[0].delta.content` and dispatch it to the reducer

**Alternatives considered:**
- **`eventsource-parser`** (npm) — a small library that handles SSE framing edge
  cases like chunks split across multiple reads. Worth adding if the stream proves
  flaky in production.
- **`EventSource` browser API** — only supports GET requests, so it can't send a
  JSON body with conversation history. Not viable here.
- **`@microsoft/fetch-event-source`** — handles reconnection and headers correctly,
  good production option but overkill for this scope.

The native approach is sufficient here because the proxy controls the SSE format and
Zod `safeParse` silently skips any malformed chunks rather than crashing.

---

### 5. State management
I used **`useReducer` + React Context** — no external state library.

**Conversation history** lives in the reducer as an array of `Session` objects, each
holding a `messages` array. On every send, the full message history of the active
session is included in the API request body so the LLM has full context.

**Streaming state** is handled by two separate concerns:
- The `isStreaming` boolean is local `useState` inside the `useChat` hook — it only
  affects the ChatInput UI and doesn't need to be global
- The `AbortController` lives in a `useRef` (not state) so aborting a stream never
  triggers a re-render
- Each assistant message has a `status` field (`"streaming" | "done" | "error"`)
  managed through the reducer, which drives the blinking cursor and error UI

**Why not Zustand:** The state tree is naturally hierarchical and lives close to the
component tree. There's no need to share state across distant unrelated subtrees, which
is the main problem Zustand solves. Adding a state library here would be indirection
without benefit.

---

### 6. Tradeoffs
**Skipped / simplified:**
- No automated tests — the time budget didn't allow for it
- Session titles are derived from the first message rather than generated by the LLM
- No optimistic UI beyond the streaming cursor (e.g. no skeleton loaders)
- Mobile layout is functional but not polished

**What I'd add first with another 3 hours:**
1. Unit tests for the SSE stream parser and the reducer — these are the two most
   logic-dense pieces and the most likely to silently regress
2. An `eventsource-parser` integration to handle chunks split across read boundaries
   more robustly
3. A proper loading skeleton for the assistant message before the first chunk arrives
4. Message timestamps and copy-to-clipboard on bubbles

---

### 7. Time spent
**~3 hours total.**

- Architecture planning in Claude.ai: ~20 minutes
- Scaffold, ESLint, and Zod schemas (prompts 1–3): ~25 minutes
- Backend proxy (prompt 4): ~20 minutes
- Context, hooks, components, wiring (prompts 5–8): ~75 minutes
- Polish, edge cases, README (prompt 9): ~40 minutes

**What took longer than expected:** The SSE stream parsing. The happy path is
straightforward, but handling the case where a single `read()` returns multiple
`data:` lines concatenated, and making sure `[DONE]` was skipped cleanly before
Zod tried to parse it, required more iteration than anticipated. Running
`tsc --noEmit` between each Claude Code prompt also caught a handful of type errors
early that would have been painful to debug later.
