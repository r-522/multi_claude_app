# Skill: debug

## Description
Debug errors across the full stack: Claude API, Cloudflare services, Remix, and React.

## When to Use
- Claude API 400 errors (bad request parameters)
- D1 query failures or migration errors
- SSE streaming disconnections or missing data
- React hydration mismatches
- Wrangler deployment failures
- Circuit breaker stuck open unexpectedly

## Common Issues + Fixes

### Claude API 400 — Wrong Parameters
**Most common cause**: temperature or effort sent to wrong model.
```
Check: MODEL_REGISTRY["claude-opus-4-8"].supportsTemperature === false
Fix: Use buildMessageParams() — never build params manually
```

### Claude API 400 — thinking: { type: "disabled" } on Fable 5
```
Fable 5 requires thinking to be adaptive (or omitted). "disabled" returns 400.
Fix: Only omit the thinking param for Fable 5; don't explicitly disable it.
```

### SSE Stream Disconnects / Empty Body
```
Check: Response has "Content-Type: text/event-stream" header
Check: Response has "X-Accel-Buffering: no" header (required for Cloudflare)
Check: Data format is exactly "data: JSON\n\n" (double newline required)
```

### D1 Migration Failures
```sh
# Check what's in the DB vs. what Drizzle expects
wrangler d1 execute DB --local --command ".schema"
# Apply individual migration manually to debug
wrangler d1 execute DB --local --file db/migrations/0001_xxx.sql
```

### React Hydration Mismatch
```
Cause: SSR renders different HTML than client hydration
Check: Any code that reads browser-only APIs (localStorage, window) without guard
Fix: Wrap in useEffect() or check typeof window !== "undefined"
```

### Wrangler Deploy: Bundle Too Large
```sh
# Check bundle composition
wrangler deploy --dry-run --outdir dist
# Shiki is usually the culprit — limit to common languages:
createHighlighter({ themes: ['one-dark-pro'], langs: ['ts', 'js', 'python', ...] })
```

### Circuit Breaker Stuck Open
```typescript
// Check KV state directly
await env.KV.get("circuit:claude")  // { state: "open", ... }
// Manually reset:
await env.KV.delete("circuit:claude")
```

## Debug Tools
- `wrangler tail` — stream live production logs
- `wrangler d1 execute DB --local --command "..."` — run SQL against local D1
- `wrangler dev` — local dev server with real workerd runtime
- Browser DevTools Network tab → filter by `text/event-stream` to inspect SSE chunks

## Logging Pattern
```typescript
// Every Claude call should log:
logger.info({
  requestId: crypto.randomUUID(),
  model: params.model,
  inputTokens: result.usage.input_tokens,
  outputTokens: result.usage.output_tokens,
  durationMs: Date.now() - start,
  stopReason: result.stop_reason,
});
// Use the request_id from Claude response headers for Anthropic support
```

## Failure Handling
- Can't reproduce locally: use `wrangler tail` + add temporary debug logging to production
- Unknown error from D1: use `wrangler d1 execute --local --command "EXPLAIN QUERY PLAN ..."` 
- Streaming works in dev but not production: add `Cache-Control: no-cache` header
