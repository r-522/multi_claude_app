# Cloudflare Services

## Service Selection Matrix

| Service | Used For | Alternative Considered | Decision |
|---------|---------|----------------------|---------|
| Pages | Host Remix app | Workers Sites | Pages has native Remix adapter |
| Workers | Server functions | Durable Objects | Workers for stateless; DOs for v1 long-running tasks |
| D1 | Primary database | Turso, PlanetScale | D1 is co-located, zero egress, Drizzle support |
| KV | Ephemeral state | D1 | Sub-ms reads for hot paths (rate limits, abort flags) |
| R2 | Log storage | D1 | Object store is cheaper than row inserts for append-only logs |
| AI Gateway | Claude proxy | Direct Anthropic | Zero-latency overhead (same PoP), adds observability + caching |
| Queues | Async processing (v1) | Cron triggers | Event-driven, retries, dead-letter queue |
| Durable Objects | Task sessions (v1) | Queues only | Long-running state that survives tab close |

## Binding Configuration (`wrangler.toml`)

```toml
[[d1_databases]]
binding = "DB"
database_name = "claude-chat-db"
database_id = "<YOUR_D1_ID>"    # From: wrangler d1 create claude-chat-db

[[kv_namespaces]]
binding = "KV"
id = "<YOUR_KV_ID>"             # From: wrangler kv:namespace create claude-chat

[[r2_buckets]]
binding = "LOGS"
bucket_name = "claude-chat-logs"  # From: wrangler r2 bucket create claude-chat-logs
```

## Cloudflare AI Gateway

All Claude API calls route through AI Gateway — zero code change required (just set `baseURL`).

**What it adds:**
- Request/response logging (in Cloudflare dashboard)
- Semantic prompt caching (same prompt → cached response in ~1ms)
- Rate limiting (before Anthropic — cheaper than 429 retries)
- Fallback chains (Opus 4.8 → Sonnet 4.6 on overload, configurable)
- Cost analytics per endpoint

**Setup:**
```
Dashboard → AI Gateway → Create gateway → copy URL
Set secret: ANTHROPIC_API_KEY=sk-ant-...
Set secret: AI_GATEWAY_URL=https://gateway.ai.cloudflare.com/v1/.../anthropic
Set secret: AI_GATEWAY_TOKEN=<gateway_auth_token>
```

## KV Key Namespace Convention

```
rate-limit:{userId}         Token bucket state { tokens, lastRefill }
abort:{conversationId}      Abort flag (TTL: 60s)
circuit:claude              Circuit breaker state { state, failures, openedAt }
session:{sessionId}         User session (v2 auth)
prompt-cache:{hash}         Cached prompt analysis result
```

## D1 Configuration

```
Local dev:  .wrangler/state/d1/ (wrangler dev auto-creates)
Production: Cloudflare dashboard → D1 → claude-chat-db

Migration workflow:
  1. Modify app/shared/lib/db/schema.ts
  2. npx drizzle-kit generate
  3. wrangler d1 execute DB --local --file db/migrations/NNN_*.sql
  4. Commit migration file (never edit generated migrations)
```

## R2 Log Structure

```
logs/{year}/{month}/{day}/{requestId}.json
```

Each file is a structured JSON object: `{ timestamp, requestId, level, feature, model, inputTokens, outputTokens, durationMs, stopReason }`.

Never read from R2 at runtime — write-only from the app. Read via Cloudflare dashboard or `wrangler r2 object get`.

## Limits Reference

| Service | Limit | Impact |
|---------|-------|--------|
| Workers CPU | 50ms per request (free), 30s (paid) | SSE streams run in Workers Streaming mode (no CPU limit) |
| D1 | 100 queries/request, 1M rows/table | No concern at single-user scale |
| KV | 1000 writes/day (free), unlimited (paid) | Rate limiter writes per request — upgrade to paid |
| R2 | 10M GET/month free | Log reads rare — no concern |
| Pages Functions | 100k requests/day (free) | Upgrade to Workers Paid for production use |
