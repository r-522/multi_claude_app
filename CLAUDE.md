# CLAUDE.md — Project Rules

## Architecture

Feature-first vertical slices. Each feature (`chat/`, `builder/`, `tasks/`) owns its own
`components/`, `hooks/`, `services/`, `repositories/`, `schemas/`, and `types/`.
No cross-feature imports — shared code lives in `app/shared/` only when 3+ features need it.
Routes are thin: validate with Zod → call one service method → return response.
Repositories own all SQL. Services own business logic. Routes own HTTP semantics.

## Tech Stack

Remix v2 (Cloudflare Pages) · TypeScript strict · Tailwind v4 · Radix UI primitives
Drizzle ORM + D1 · @anthropic-ai/sdk · Jotai · Zod · Vitest + Playwright

## Coding Rules

- TypeScript strict mode everywhere. No `any` — use `unknown` and narrow with type guards.
- Zod for all I/O boundaries (API request, API response, env vars).
- All DB access through Drizzle repositories — no raw SQL outside `*Repository.ts` files.
- Named exports only (no default exports except route files and `root.tsx`).
- File size ≤ 200 lines. Extract when larger.
- No `console.log` in production — use the structured logger at `~/shared/lib/logger`.
- No half-finished `TODO`/`FIXME` in committed code — open a GitHub Issue instead.

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Files | `kebab-case.ts` | `chat-service.ts` |
| React components | `PascalCase.tsx` | `MessageItem.tsx` |
| Hooks | `use` prefix | `useStream.ts` |
| Services | `FeatureService.ts` | `ChatService.ts` |
| Repositories | `FeatureRepository.ts` | `ConversationRepository.ts` |
| Schemas | `feature.schema.ts` | `chat.schema.ts` |
| Types | `feature.types.ts` | `chat.types.ts` |
| DB columns | `snake_case` | `created_at` |
| TS identifiers | `camelCase` | `maxTokens` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_RETRIES` |

## Testing Philosophy

Unit tests for pure functions and service methods (Vitest).
Integration tests for repository methods against real Miniflare D1 (no mocks).
E2E tests for complete user flows (Playwright).
Mock Claude at the service boundary — never inside services.
Coverage thresholds: 80% lines/functions, 75% branches.
Test file colocated with source: `ServiceName.test.ts` next to `ServiceName.ts`.

## Commit Rules

Conventional commits: `feat:` `fix:` `chore:` `docs:` `test:` `refactor:` `perf:` `ci:`
One logical change per commit. No WIP commits to main.
PR must pass CI and have at least one review approval before merge.

## Review Philosophy

1. **Security**: Secrets not in code. No SQL injection vectors. Input validated at boundaries.
2. **Correctness**: Claude params built via `buildMessageParams()`. `stop_reason:"refusal"` handled.
3. **Performance**: No N+1 queries. KV caching for hot reads. SSE headers correct.
4. **UX**: Every async operation has a loading and error state in the UI.
5. **Architecture**: Feature slice boundaries respected. No Drizzle in route files.

## Do

- **Always** use `buildMessageParams()` in `~/shared/lib/claude/models` — never construct Claude params manually
- Check `ModelConfig.supportsTemperature` before adding `temperature` to params
- Check `ModelConfig.supportsEffort` before adding `output_config.effort` to params
- **Never** send `thinking: { type: "disabled" }` to Fable 5 (returns 400)
- Handle `stop_reason: "refusal"` explicitly in every streaming route
- Use `context.cloudflare.env.KV.waitUntil()` for fire-and-forget R2 log writes
- Store all secrets in Cloudflare dashboard / `wrangler secret put` only
- Log the Claude `request_id` from response headers for Anthropic support debugging

## Don't

- Don't import `drizzle-orm` directly in route files — go through repositories
- Don't hardcode model ID strings outside `MODEL_REGISTRY` in `~/shared/lib/claude/models`
- Don't catch errors silently — always log with context or rethrow as `AppError`
- Don't use `any` type — prefer `unknown` with type guards
- Don't add features or refactoring cleanup to a bug-fix PR
- Don't commit `.dev.vars` or any file containing real API keys
- Don't `budget_tokens` on Claude API — use `output_config: { effort }` instead

## Skills

`/architecture` `/frontend` `/backend` `/api-design` `/cloudflare` `/testing`
`/deployment` `/security` `/prompt-engineering` `/reviewer` `/refactoring`
`/documentation` `/task-loop` `/research` `/debug`

Full descriptions: `.claude/skills/*/SKILL.md`

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Local Wrangler dev server (port 8788) |
| `npm run build` | Production build |
| `npm run deploy` | Deploy to Cloudflare Pages |
| `npm run typecheck` | TypeScript type check |
| `npm run lint` | ESLint |
| `npm run test` | Unit + integration tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright) |
| `npm run db:generate` | Generate Drizzle SQL migrations |
| `npm run db:migrate` | Apply migrations locally |
| `npm run db:migrate:remote` | Apply migrations to production D1 |

## Directory Reference

```
app/features/{chat,builder,tasks}/   Feature vertical slices
app/shared/lib/claude/               Claude API client, models, circuit breaker
app/shared/lib/db/                   Drizzle client + schema
app/shared/components/ui/            Design system primitives (Radix-based)
app/routes/                          Remix routes (thin, delegate to services)
db/migrations/                       Generated SQL migration files
docs/                                Technical documentation
.claude/skills/                      Claude Code skill definitions
```
