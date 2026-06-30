# Troubleshooting

## Claude API Errors

### 400 Bad Request
**Most common cause:** Wrong parameter for the model.

Checklist:
- Did you call `buildMessageParams()` or build params manually? → Always use `buildMessageParams()`
- Is temperature set for Opus 4.8 or Fable 5? → Temperature not supported, will 400
- Is effort set for Haiku 4.5? → Effort not supported, will 400
- Is `thinking: { type: "disabled" }` sent to Fable 5? → Always-on, "disabled" will 400
- Is `effort: "xhigh"` sent to Sonnet 4.6? → Not supported, use "high"

To debug: log the full params object before the API call (exclude only `apiKey`).

### 429 Rate Limited
The rate limiter (KV) should catch this before reaching Anthropic. If 429 still surfaces:
1. Check KV is functioning: `wrangler kv:key get --namespace-id=<id> "rate-limit:default"`
2. The circuit breaker's failure counter may be incrementing — check `circuit:claude` key
3. Wait for the Anthropic rate limit window (usually 1 minute)

### 529 Overloaded
Anthropic transient overload. Circuit breaker handles retries with exponential backoff. If persistent:
1. Switch to a different model (Sonnet → Haiku) as a temporary fallback
2. Check Anthropic status page

## Streaming Issues

### Stream shows nothing in browser
1. Check Response headers include `X-Accel-Buffering: no`
2. Check `Content-Type: text/event-stream` is set
3. Check browser DevTools → Network → filter `EventStream` — do events appear?
4. Check `data: ` prefix and `\n\n` double-newline format in each event

### Stream stops mid-message
1. Was the abort flag accidentally set? Check `KV.get("abort:{conversationId}")`
2. Did the circuit breaker trip? Check `KV.get("circuit:claude")`
3. Check R2 logs for the request — what was the `stopReason`?

### `stop_reason: "refusal"` appearing unexpectedly
The prompt or conversation context triggered Claude's safety filter. This is a valid response — do not retry. Show user-friendly message instead.

## Database Issues

### D1 migration fails
```sh
# Check current schema
wrangler d1 execute DB --local --command ".schema"

# Run specific migration manually
wrangler d1 execute DB --local --file db/migrations/NNNN.sql

# Check for syntax error in migration SQL
wrangler d1 execute DB --local --command "SELECT 1"  # confirms D1 is working
```

### Query returns unexpected results
```sh
# Open Drizzle Studio for visual inspection
npx drizzle-kit studio

# Or query directly
wrangler d1 execute DB --local --command "SELECT * FROM conversations LIMIT 5"
```

## Build Failures

### Bundle too large
Shiki (syntax highlighting) includes many language grammars by default. Limit languages:
```typescript
// app/shared/lib/markdown/renderer.ts
const highlighter = await createHighlighter({
  themes: ["one-dark-pro"],
  langs: ["typescript", "javascript", "python", "bash", "json", "sql", "css", "html"],
});
```

### TypeScript errors after adding model
If you add a new model to `MODEL_REGISTRY`, update:
1. `ModelId` union type in `app/shared/types/claude.ts`
2. `MODEL_REGISTRY` constant in `app/shared/lib/claude/models.ts`
3. `ModelSelector` component options

### React hydration mismatch
Wrap browser-only code:
```typescript
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;
```

## Deployment Issues

### `wrangler pages deploy` fails with "D1 binding not found"
Update `wrangler.toml` with correct database_id from `wrangler d1 list`.

### Pages Function exceeds CPU time limit
SSE streaming responses run in Workers Streaming mode (no CPU limit). For non-streaming routes, check for O(n) loops or missing indexes on D1 queries.

## Debugging Tools

```sh
wrangler tail               # Live production logs
wrangler dev                # Local dev with real workerd runtime
npx drizzle-kit studio      # Visual D1 browser
```
