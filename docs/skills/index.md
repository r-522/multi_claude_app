# Skills Catalog

15 skills in `.claude/skills/`. Load a skill to get specialized guidance for a task domain.

| Skill | File | When to Use |
|-------|------|-------------|
| `architecture` | `.claude/skills/architecture/SKILL.md` | Vertical slice design, cross-feature decisions, adding new features |
| `frontend` | `.claude/skills/frontend/SKILL.md` | React components, hooks, Tailwind, dark mode, Radix UI |
| `backend` | `.claude/skills/backend/SKILL.md` | Remix routes, services, repositories, SSE streaming patterns |
| `api-design` | `.claude/skills/api-design/SKILL.md` | API contracts, Zod schemas, StreamChunk spec, request/response typing |
| `cloudflare` | `.claude/skills/cloudflare/SKILL.md` | D1, KV, R2, AI Gateway, Wrangler, Durable Objects |
| `testing` | `.claude/skills/testing/SKILL.md` | Unit tests (Vitest), integration tests (Miniflare D1), E2E (Playwright) |
| `deployment` | `.claude/skills/deployment/SKILL.md` | CI/CD, Wrangler deploy, D1 migrations, first deployment walkthrough |
| `security` | `.claude/skills/security/SKILL.md` | CSP headers, secrets management, input validation, rate limiting |
| `prompt-engineering` | `.claude/skills/prompt-engineering/SKILL.md` | Claude prompts for all 3 features, model selection, effort tuning |
| `reviewer` | `.claude/skills/reviewer/SKILL.md` | Code review checklist, Claude API correctness, architecture compliance |
| `refactoring` | `.claude/skills/refactoring/SKILL.md` | File decomposition, service extraction, import graph cleanup |
| `documentation` | `.claude/skills/documentation/SKILL.md` | Writing docs/, ADRs, Mermaid diagrams |
| `task-loop` | `.claude/skills/task-loop/SKILL.md` | Tasks feature: state machine, phase prompts, retry logic |
| `research` | `.claude/skills/research/SKILL.md` | Technical decisions, external docs, library evaluation |
| `debug` | `.claude/skills/debug/SKILL.md` | Debugging Claude 400s, SSE issues, D1 errors, hydration mismatches |

## Critical Skills

Always load before starting relevant work:

- **Before any Claude API code** → `api-design` + `prompt-engineering`
- **Before any Cloudflare infrastructure work** → `cloudflare`
- **Before any Tasks feature work** → `task-loop`
- **Before reviewing a PR** → `reviewer`
- **Before deploying** → `deployment` + `security`
