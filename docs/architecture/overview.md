# Architecture Overview

## System Summary

Claude Chat is a single-tenant developer tool running on Cloudflare's edge network. The user's browser talks to a Remix application running as Cloudflare Pages Functions, which orchestrates Claude API calls, persists data to D1, caches hot state in KV, and writes logs to R2.

## C4 Context Diagram

```mermaid
C4Context
  title System Context — Claude Chat

  Person(user, "Developer", "Single authenticated user")

  System(app, "Claude Chat", "Remix on Cloudflare Pages\nStreaming chat, Prompt Builder, Tasks")

  System_Ext(claude, "Anthropic Claude API", "LLM inference\nclaude-fable-5, claude-opus-4-8, etc.")
  System_Ext(gateway, "Cloudflare AI Gateway", "Proxy: observability, caching, rate limiting")

  Rel(user, app, "HTTPS / SSE")
  Rel(app, gateway, "HTTPS — all Claude API calls")
  Rel(gateway, claude, "HTTPS")
```

## C4 Container Diagram

```mermaid
C4Container
  title Container Diagram — Claude Chat

  Person(user, "Developer")

  Container(remix, "Remix App", "TypeScript + Vite", "Routes, loaders, actions, SSE streams")

  ContainerDb(d1, "Cloudflare D1", "SQLite", "Conversations, messages, prompts, tasks")
  ContainerDb(kv, "Cloudflare KV", "Key-value", "Sessions, rate limits, abort flags, circuit state")
  ContainerDb(r2, "Cloudflare R2", "Object store", "Structured logs, task artifacts")

  Container(gateway, "AI Gateway", "Cloudflare", "Proxy + cache + observability")

  System_Ext(anthropic, "Anthropic API")

  Rel(user, remix, "HTTPS", "Loaders + SSE streams")
  Rel(remix, d1, "SQL via Drizzle")
  Rel(remix, kv, "KV operations")
  Rel(remix, r2, "PutObject (waitUntil)")
  Rel(remix, gateway, "HTTPS (proxied Claude calls)")
  Rel(gateway, anthropic, "HTTPS")
```

## Request Routing

```
Browser → Cloudflare CDN → Pages Function (Workers runtime)
  ├── GET  /*              → Remix loader (SSR)
  ├── POST /api/*          → Remix action (API route)
  └── GET  /api/*/stream   → SSE streaming response (action)
```

## Vertical Slice Architecture

```
app/
├── routes/          # Thin: validate → service → response
├── features/
│   ├── chat/        # Components, hooks, services, repos, schemas, types
│   ├── builder/     # Same structure
│   └── tasks/       # Same structure
└── shared/
    ├── components/  # Design system atoms + layout
    ├── lib/         # Claude client, DB client, KV, errors, utils
    └── types/       # Env, API, Claude types
```

**Rule:** Features never import from each other. Shared code extracted to `app/shared/` only when 3+ features need it.

## Data Store Responsibilities

| Store | Data | Why |
|-------|------|-----|
| D1 | Conversations, messages, prompts, tasks, sub-tasks, logs | Relational, queryable, durable |
| KV | Rate limit buckets, abort flags, circuit state, prompt cache | Sub-ms reads, ephemeral OK |
| R2 | Structured JSON logs, large task outputs | Cheap object storage, never query |

## Cold Start + Performance

- Workers V8 isolate: 3–8ms cold start (no container spin-up)
- SSE streaming: first token visible in < 1s (AI Gateway same PoP)
- D1 reads: ~1ms (co-located)
- KV reads: < 1ms (global replication)
