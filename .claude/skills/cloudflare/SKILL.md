# Skill: cloudflare

## Description
Work with Cloudflare Pages, Workers, D1, KV, R2, AI Gateway, and related Cloudflare services.

## When to Use
- Configuring `wrangler.toml` bindings
- Writing KV cache/rate-limit operations
- Working with D1 in Drizzle
- Configuring AI Gateway as Claude API proxy
- Debugging Cloudflare-specific issues (cold starts, CPU limits, Worker size)
- Setting up R2 for structured log storage

## Workflow
1. Check `wrangler.toml` for existing bindings before adding new ones
2. Type new bindings in `app/shared/types/env.ts` `Env` interface immediately
3. Test locally with `wrangler dev` — it runs the actual workerd runtime
4. For secrets: `wrangler secret put KEY_NAME` (never in wrangler.toml values)

## Service Selection Guide

| Use Case | Service |
|----------|---------|
| Relational data (conversations, messages) | D1 |
| Sessions, rate-limit state | KV |
| Large structured logs | R2 |
| Claude API proxy + observability | AI Gateway |
| Background tasks (v1) | Queues |
| Long-running stateful tasks (v1) | Durable Objects |

## KV Key Naming
```
abort:{userId}:{conversationId}       # Stream abort flag
rate:{userId}:req                     # Request rate limiter tokens
rate:{userId}:tokens                  # Token rate limiter
circuit:{service}                     # Circuit breaker state
conv-list:{userId}                    # Cached conversation list
```

## R2 Object Naming
```
logs/{feature}/{YYYY-MM-DD}/{requestId}.json
```

## AI Gateway Setup
```typescript
// In createClaudeClient(env):
baseURL: env.AI_GATEWAY_URL ?? undefined
// AI_GATEWAY_URL = https://gateway.ai.cloudflare.com/v1/{accountId}/{gatewayId}/anthropic
```

## Failure Handling
- D1 database_id not set: throws at runtime — check wrangler.toml
- KV id placeholder: wrangler dev uses preview_id — set both
- Worker script too large: audit Shiki language imports (limit to ~15 common languages)
- CPU time exceeded: move computation to Queue consumer, return early

## Examples
- Rate limiter: KV `GET` → check tokens, `PUT` → decrement, TTL 60s
- Circuit breaker: KV stores `{ state, failures, lastFailure }`, TTL 60s
- D1 migration: `npm run db:generate` → `npm run db:migrate` (local) → verify SQL → push remote
