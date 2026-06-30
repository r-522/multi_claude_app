# Environment Variables Reference

## Secrets (via `wrangler secret put`)

Never committed to version control. Set in Cloudflare dashboard.

| Secret | Description | Example Format |
|--------|-------------|---------------|
| `ANTHROPIC_API_KEY` | Anthropic API key | `sk-ant-api03-...` |
| `AI_GATEWAY_URL` | Cloudflare AI Gateway endpoint | `https://gateway.ai.cloudflare.com/v1/{account}/{name}/anthropic` |
| `AI_GATEWAY_TOKEN` | AI Gateway auth token | UUID format |

## Bindings (in `wrangler.toml`)

Injected by Cloudflare runtime — not environment variables but typed bindings.

| Binding | Type | Purpose |
|---------|------|---------|
| `DB` | D1Database | Primary SQLite database |
| `KV` | KVNamespace | Rate limits, abort flags, circuit state |
| `LOGS` | R2Bucket | Structured request logs |

## Local Development

For local dev, Wrangler provides binding stubs automatically. Secrets need a `.dev.vars` file:

```sh
# .dev.vars (NEVER commit this file)
ANTHROPIC_API_KEY=sk-ant-api03-...
AI_GATEWAY_URL=https://gateway.ai.cloudflare.com/v1/.../anthropic
AI_GATEWAY_TOKEN=...
```

`.dev.vars` is in `.gitignore`. Wrangler reads it during `wrangler dev`.

## TypeScript Env Interface

```typescript
// app/shared/types/env.ts
export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  LOGS: R2Bucket;
  ANTHROPIC_API_KEY: string;
  AI_GATEWAY_URL: string;
  AI_GATEWAY_TOKEN: string;
}
```

All bindings are accessed via `context.cloudflare.env` in Remix loaders/actions. Never accessed from client-side code.

## CI/CD Secrets (GitHub Actions)

| Secret Name | Value |
|-------------|-------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages:Edit permission |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |

Set via: GitHub → Repository → Settings → Secrets and variables → Actions.

The Anthropic API key is NOT needed in CI — it's set via Wrangler secrets in the Cloudflare dashboard, not in GitHub.
