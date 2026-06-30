# ADR-001: Framework — Remix on Cloudflare Pages

## Status
Accepted

## Context

We need a full-stack framework for a developer tool deployed on Cloudflare. Requirements:
- Server-side rendering for fast initial load
- SSE streaming for Claude API responses (streaming requires server)
- Cloudflare Pages deployment (no additional infrastructure)
- React ecosystem for UI components (Radix UI, etc.)
- TypeScript first-class support

Candidates evaluated:
- **Next.js**: Most popular, but requires OpenNext adapter for Cloudflare Pages, adding a maintenance burden
- **SvelteKit**: Native Cloudflare adapter, but smaller component ecosystem (no Radix UI equivalents)
- **Hono + React SPA**: Clean server, but two separate apps, no SSR, SSE streaming is bespoke
- **Remix**: Native Cloudflare Pages adapter via `@remix-run/cloudflare-pages`, first-class SSE, React ecosystem
- **Astro**: Great for static sites, but streaming state management is awkward for this use case

## Decision

Use **Remix v2** with `@remix-run/cloudflare-pages` adapter.

The native adapter means zero additional abstraction between Remix and Cloudflare. SSE streaming works through Remix `action` functions returning `Response(ReadableStream, {...})` — standard Web API, no framework magic needed. React ecosystem gives access to Radix UI, Jotai, and the full testing toolchain.

## Consequences

**Good:**
- Zero Cloudflare adapter overhead (same as raw Workers)
- SSE streaming is standard `ReadableStream` API
- Full React ecosystem available
- Nested routing maps cleanly to 3-screen layout
- Cold starts ~3–8ms (V8 isolate, no container)

**Bad:**
- Remix v2 → v3 migration may require work (mitigated by `future` flags already enabled in `vite.config.ts`)
- Less popular than Next.js — fewer community examples for Cloudflare-specific patterns
- No App Router model — must use Remix's loader/action convention
