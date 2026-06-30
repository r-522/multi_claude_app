# Skill: backend

## Description
Implement Remix routes, services, and repositories for server-side logic on Cloudflare Workers.

## When to Use
- Writing loader/action functions in `app/routes/`
- Implementing service classes in `app/features/*/services/`
- Writing repository classes in `app/features/*/repositories/`
- Working with D1, KV, or R2 bindings
- Handling SSE streaming responses

## Workflow
1. Route: validate request with Zod schema → call service → return typed Response
2. Service: orchestrate repositories + external calls (Claude, KV, R2)
3. Repository: write pure Drizzle queries — no business logic, no external calls
4. Test: unit test service with mocked dependencies; integration test repository with real D1

## Best Practices
- Always type `context.cloudflare.env` as `Env` from `~/shared/types/env`
- Never access `process.env` — use `context.cloudflare.env` for secrets
- D1 queries go through Drizzle only — no raw SQL strings in app code
- KV keys follow pattern: `{feature}:{userId}:{qualifier}` (e.g., `abort:default:conv-123`)
- R2 log keys follow: `logs/{feature}/{YYYY-MM-DD}/{requestId}.json`
- Use `context.cloudflare.ctx.waitUntil()` for fire-and-forget operations (R2 writes, KV updates)
- Set `X-Accel-Buffering: no` on SSE responses to disable proxy buffering

## SSE Streaming Pattern
```typescript
// Route handler for streaming
return new Response(
  new ReadableStream({
    async start(controller) {
      const enqueue = (chunk: StreamChunk) =>
        controller.enqueue(`data: ${JSON.stringify(chunk)}\n\n`);
      // ... stream from Claude
      controller.close();
    },
  }),
  {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  }
);
```

## Failure Handling
- Claude 400: log full request params (minus API key), return 400 — these are code bugs
- Claude 429: pass through `Retry-After` header to client
- D1 constraint violation: catch DrizzleError, wrap in DatabaseError, return 409
- Stream interrupted: save partial content to D1 with `stopReason: "interrupted"`

## Examples
- Chat stream: `api.chat.stream.ts` validates → rate limit → circuit breaker → stream → save
- Builder analyze: single non-streaming call → parse JSON response → return analysis
- Task execute: single call with phase context → return output text for that phase
