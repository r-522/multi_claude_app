# ADR-003: Streaming — Server-Sent Events (SSE)

## Status
Accepted

## Context

Claude API supports streaming responses. We need to stream tokens to the browser in real-time to provide the expected chat UX (tokens appear as they're generated).

Options:
- **Server-Sent Events (SSE)**: HTTP/1.1, unidirectional server→client, browser-native EventSource or fetch-based streaming, works through Cloudflare
- **WebSockets**: Bidirectional, persistent connection, more complex to set up and manage on Cloudflare Pages
- **Long polling**: Simple but high latency between tokens, poor UX
- **HTTP chunked transfer**: Same as SSE fundamentally — SSE is chunked transfer with a standardized format

For the client implementation:
- **EventSource API**: Browser-native, automatic reconnect, but only supports GET (can't send POST body)
- **fetch + ReadableStream**: Supports POST bodies, more control, no automatic reconnect needed

## Decision

Use **SSE** via **fetch + ReadableStream** on the client.

EventSource is ruled out because streaming chat requires sending the full request body (conversation history, system prompt, model config) as a POST. Fetch with a ReadableStream response achieves SSE's benefits without this limitation.

The wire format is standard SSE (`data: JSON\n\n` per event) for compatibility with any future EventSource migration.

## Consequences

**Good:**
- Works natively on Cloudflare Workers with `ReadableStream`
- POST bodies carry all required request context
- No WebSocket connection management complexity
- First token visible in < 1s (no connection negotiation overhead)
- `X-Accel-Buffering: no` header disables Cloudflare CDN buffering

**Bad:**
- Client must implement manual stream parsing (split on `\n\n`, strip `data: ` prefix)
- No automatic reconnect — if the network drops, the client must restart the request
- Partial message recovery requires explicit save logic on stream interruption
