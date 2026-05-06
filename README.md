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
Claude.ai (Sonnet) for upfront architecture planning — state management approach, schema boundaries, and implementation order. Claude Code (Sonnet, terminal) for execution, running `tsc --noEmit` between each prompt to catch type errors early. No code was written manually.

---

### 2. API discovery
The brief provided the base URL. I hit `GET /v1/models` with the provided API key to list available model IDs, picked the first one, and confirmed it responded correctly with a quick non-streaming test request before wiring it into the app.

---

### 3. Architecture
API calls go through the Express backend, not the browser directly. Calling from the frontend would expose the API key in devtools and the JS bundle. In production I'd move the key to a secrets manager, add auth middleware, per-user rate limiting, and consider an edge runtime for lower latency.

---

### 4. Streaming implementation
Native `fetch` + `ReadableStream` — no library. The server pipes the LLM's SSE response straight to the client. On the client, a `TextDecoder` loop splits chunks on `\n`, skips `[DONE]`, and validates each `data:` line with Zod `safeParse`. The main alternative would be `eventsource-parser` for more robust SSE framing, or `@microsoft/fetch-event-source` for built-in reconnection.

---

### 5. State management
`useReducer` + React Context. All sessions and messages live in a single reducer; streaming state is modelled as a `status` field on each message (`streaming | done | error`). `AbortController` is a ref, not state, so aborting never triggers a re-render. Zustand wasn't needed — there's no cross-tree state sharing.

---

### 6. Tradeoffs
Skipped: automated tests, LLM-generated session titles, skeleton loaders. With another 3 hours I'd add unit tests for the reducer and SSE parser first, then `eventsource-parser` for production robustness.

---

### 7. Time spent
~3 hours total. SSE parsing took longer than expected — correctly handling chunks where a single `read()` delivers multiple `data:` lines, and cleanly skipping `[DONE]` before Zod sees it, needed more iteration than the happy path suggested.
