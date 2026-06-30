# ADR-002: Database — Cloudflare D1 + Drizzle ORM

## Status
Accepted

## Context

We need a database that is:
- Co-located with Cloudflare Workers (low latency)
- Type-safe with ORM support
- Affordable at single-user scale (< 1000 requests/day)
- Supports schema migrations

Candidates evaluated:
- **Cloudflare D1**: SQLite on Cloudflare's infrastructure, native Workers binding, free tier is sufficient
- **Turso**: SQLite-compatible, global replication, but adds external dependency and egress cost
- **PlanetScale**: MySQL-compatible, good DX, but expensive for low traffic and adds external dependency
- **Neon**: Postgres serverless, great DX, but external dependency with cold-start latency on queries
- **Cloudflare KV only**: Key-value is not suitable for relational conversation data

For the ORM:
- **Drizzle**: Native D1 support, TypeScript-first, lightweight, migrations via `drizzle-kit`
- **Prisma**: Too heavy for Cloudflare Workers (binary engine), D1 support is experimental

## Decision

Use **Cloudflare D1** with **Drizzle ORM**.

D1 is co-located with the Workers runtime — queries take ~1ms. Zero egress cost. No external dependency to manage. Drizzle provides type-safe query building and migration generation that works natively with D1.

## Consequences

**Good:**
- ~1ms D1 query latency (same PoP as Workers)
- Zero egress cost
- Type-safe queries via Drizzle
- Migration workflow via `drizzle-kit generate` + `wrangler d1 execute`
- No additional service to configure or pay for

**Bad:**
- D1 is SQLite — no full-text search (workaround: `LIKE` queries or FTS5 extension)
- D1 has a 1MB per row limit — large task outputs may need to go to R2 for very long content
- Drizzle's D1 adapter doesn't support all SQLite features (e.g., triggers)
- D1 has eventual consistency on global replication — acceptable for single-user
