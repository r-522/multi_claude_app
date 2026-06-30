# Security Model

## Threat Model

This is a single-user personal tool. The primary threats are:
1. **API key leakage** — `ANTHROPIC_API_KEY` exposed in logs, client bundle, or error messages
2. **SSRF / prompt injection** — user-controlled content causing unintended server-side requests
3. **Cost abuse** — unauthorized users calling Claude (no auth in MVP)
4. **Data leakage** — conversation history exposed to other users (not applicable single-user)

## Secrets Management

| Secret | Storage | Never in |
|--------|---------|---------|
| `ANTHROPIC_API_KEY` | Cloudflare dashboard (`wrangler secret put`) | `.env`, code, logs |
| `AI_GATEWAY_URL` | Cloudflare secret | Client bundle |
| `AI_GATEWAY_TOKEN` | Cloudflare secret | Client bundle |

**Enforcement:** The `Env` interface in `app/shared/types/env.ts` only exposes secrets server-side. Routes never serialize secrets into JSON responses.

## Content Security Policy

File: `public/_headers`

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

Note: `unsafe-inline` for scripts is required by Remix hydration. Migrate to nonce-based CSP in v1.

## Input Validation

All route inputs validated with Zod before any business logic runs:

```typescript
// Pattern for all API routes
export async function action({ request }: ActionFunctionArgs) {
  const body = await request.json();
  const result = MyRequestSchema.safeParse(body);
  if (!result.success) {
    return json({ error: result.error.flatten() }, { status: 400 });
  }
  // Only reaches here with type-safe validated data
  const service = new MyService(env);
  return json(await service.handle(result.data));
}
```

## Error Response Policy

Error responses never include:
- Stack traces (caught by error boundary, logged to R2 only)
- Internal system identifiers (DB row IDs leaked in 404s)
- Anthropic API key or gateway tokens
- SQL query text

```typescript
// AppError.toResponse() — safe serialization
return json({
  error: this.code,      // "RATE_LIMIT_EXCEEDED"
  message: this.message, // User-facing message only
  // no: stack, details, internal ID
}, { status: this.statusCode });
```

## Rate Limiting

KV token bucket rate limiter on all Claude-calling routes:

```
Default: 20 requests / minute per userId
Burst: 5 (allows brief spikes)
Response on limit: 429 + Retry-After header
```

Claude is never called before the rate limit check passes.

## Auth Readiness (v2 Seam)

MVP: single user, no auth. Security maintained by obscurity (no public URL shared).

v2 upgrade path (no schema migration needed):
1. Add Cloudflare Access in front of Pages (zero-code auth)
2. Or: add Remix session middleware + KV session store
3. `userId` field already exists on all tables — flip from `"default"` to real ID

## Audit Log

All Claude API calls logged to R2 with `requestId`, `model`, `inputTokens`, `outputTokens`, `durationMs`. This enables cost auditing and anomaly detection if the API key is ever compromised.
