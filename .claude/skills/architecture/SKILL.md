# Skill: architecture

## Description
Design and review system architecture decisions for this Remix + Cloudflare codebase.

## When to Use
- Deciding where new functionality belongs (which feature slice, which layer)
- Reviewing data flow between services, repositories, and routes
- Evaluating trade-offs when choosing Cloudflare services (D1 vs KV vs R2)
- Planning a new feature's integration with existing patterns
- Checking if a design violates Clean Architecture or vertical slice boundaries

## Workflow
1. Read `docs/architecture/overview.md` and `CLAUDE.md` for context
2. Map the new functionality to: Which feature? Which layer (route/service/repo)?
3. Check if any shared code needs extraction to `app/shared/`
4. Verify DB schema changes are backward compatible
5. Confirm Cloudflare service selection fits the access pattern

## Best Practices
- Routes are thin: validate (Zod) → call service → return response. No DB access.
- Services own business logic. Repositories own SQL. Never mix.
- Cross-feature dependency = code smell. Extract to shared/ or re-examine design.
- New Cloudflare service = new ADR entry in `docs/adr/`
- Data that's hot (read > 10×/min per user) → KV. Cold data → D1.
- Tasks that exceed 30 seconds → Queues or Durable Objects.

## Failure Handling
- If a feature grows too large: split into sub-features, each with own slice
- If shared/ grows too large: consider if features are over-sharing and should own their logic
- If a service has DB concerns: extract to a repository class

## Examples
- Chat stream needs abort: belongs in `api.chat.stop.ts` route → `ChatService.abort()` → KV flag
- New model added: update `MODEL_REGISTRY` in `~/shared/lib/claude/models` only — all callers adapt
- Task needs to survive tab close: upgrade from client-side loop to Durable Object (v1)
