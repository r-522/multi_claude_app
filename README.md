# Multi Claude App

A full-featured personal developer tool for Claude API integration with streaming chat, prompt engineering, and task decomposition — deployed on Cloudflare Pages.

## Features

### 💬 Chat
- **Real-time streaming** with token-by-token output
- **Model switching** (Claude Sonnet 4.6, Opus 4.8, Haiku 4.5, Fable 5)
- **Conversation history** with persistence and sidebar navigation
- **System prompt customization** and temperature control
- **Stop mid-stream**, regenerate, and copy messages
- **Token counting** for each message

### 🔨 Prompt Builder
- **Analyze raw prompts** → identify purpose, constraints, output format, gaps, and improvements
- **Generate 4 levels** of output (Simple / Standard / Professional / Research)
- **Compare versions** with improvement reasoning visible
- **Copy and iterate** directly from the builder

### ✓ Tasks
- **AI decomposition** of goals into ordered sub-tasks
- **Execution loop**: Plan → Execute → Review for each sub-task
- **Real-time status** tracking (Todo / Doing / Done / Failed / Retry)
- **Per-task logs** for debugging
- **Pause and resume** execution flow

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Remix v2 · TypeScript strict · Tailwind CSS v4 · Radix UI primitives · Jotai |
| **Backend** | Cloudflare Pages Workers · Wrangler |
| **Database** | Drizzle ORM + Cloudflare D1 |
| **Testing** | Vitest · Playwright (E2E) |
| **AI** | @anthropic-ai/sdk with streaming, circuit breaker, rate limiter |

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Wrangler CLI: `npm i -g wrangler`
- Anthropic API key

### Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .dev.vars.example .dev.vars

# Add your Anthropic API key to .dev.vars
# ANTHROPIC_API_KEY=sk-...

# Generate database schema
npm run db:generate
npm run db:migrate

# Start local dev server
npm run dev
```

Visit `http://localhost:8788`

## Project Structure

```
app/
├── features/               # Feature vertical slices
│   ├── chat/              # Streaming chat interface
│   ├── builder/           # Prompt analysis & generation
│   └── tasks/             # Goal decomposition & execution
├── routes/                # Remix routes (thin delegation)
├── shared/
│   ├── lib/claude/        # Claude API client, models, circuit breaker
│   ├── lib/db/            # Drizzle schema & client
│   ├── components/        # Shared UI components
│   └── types/             # Shared TypeScript types
└── styles/                # Tailwind + CSS tokens
```

**Architecture principle:** Feature-first vertical slices. Each feature owns its own components, hooks, services, repositories, and schemas. Shared code lives in `app/shared/` only when 3+ features need it.

## Development

```bash
# Type check
npm run typecheck

# Lint
npm run lint

# Test (unit + integration)
npm run test

# Test (end-to-end)
npm run test:e2e

# Build for production
npm run build

# Deploy to Cloudflare Pages
npm run deploy
```

## Deployment

This app runs on **Cloudflare Pages** with D1 database and KV cache.

### First-time setup
1. Create Cloudflare account and project
2. Configure environment secrets via `wrangler secret put`
3. Run `npm run deploy`

### Secrets required
- `ANTHROPIC_API_KEY` — Claude API key
- (Optional) Custom domain SSL configuration

See [deployment docs](./docs/deployment/cloudflare-setup.md) for details.

## Coding Standards

### Language & Types
- **TypeScript strict mode** everywhere
- **No `any` types** — use `unknown` with type guards
- **Zod for I/O validation** at API boundaries
- **Named exports only** (except routes and `root.tsx`)

### File Organization
- **Max 200 lines per file** — extract when larger
- **Files**: kebab-case (`chat-service.ts`)
- **Components**: PascalCase (`MessageItem.tsx`)
- **Hooks**: `use` prefix (`useStream.ts`)
- **Services/Repos**: Feature prefix (`ChatService.ts`, `ConversationRepository.ts`)

### Database & API
- **Drizzle repositories** own all SQL queries
- **Services** own business logic
- **Routes** validate input → call service → return response
- **No raw SQL** outside `*Repository.ts` files

### Testing
- **Unit tests** for pure functions and services (Vitest)
- **Integration tests** for repositories against real Miniflare D1
- **E2E tests** for complete user flows (Playwright)
- **Coverage targets**: 80% lines/functions, 75% branches

### Commits
- Conventional format: `feat:` `fix:` `chore:` `docs:` `test:` `refactor:`
- One logical change per commit
- PR requires CI pass + 1 review before merge

## Key Features Deep Dive

### Claude API Integration
- **Smart parameter building** via `buildMessageParams()` for model-specific features
- **Streaming with Server-Sent Events** for real-time token output
- **Circuit breaker** for graceful API failure handling
- **Rate limiter** to respect API quotas
- **Request ID logging** for Anthropic support debugging

### Model Support
- **Sonnet 4.6** (default, balanced)
- **Opus 4.8** (reasoning, no temperature)
- **Haiku 4.5** (fast, cost-effective)
- **Fable 5** (extended thinking, no temperature)

See [model capabilities](./docs/api/model-capabilities.md) for feature matrix.

### Error Handling
- Explicit `stop_reason: "refusal"` handling in streaming routes
- Structured logging with `~/shared/lib/logger`
- `AppError` for application-level errors
- No silent catches — always log context or rethrow

## Roadmap

### MVP (Current)
- [ ] Chat with streaming and model switching
- [ ] Prompt builder with analysis and generation
- [ ] Task decomposition and execution loop
- [ ] Models working correctly without 400 errors
- [ ] Deployed to Cloudflare Pages
- [ ] Core E2E tests passing

### Beta (+3 weeks)
- Circuit breaker and rate limiter under load
- R2 structured logging
- KV caching for performance
- Syntax highlighting for 8 languages
- Full keyboard navigation
- Mobile responsiveness (320px–1920px)

### v1 (+6 weeks)
- Durable Objects for background tasks
- Conversation export (Markdown)
- Prompt builder history with search
- Token usage analytics
- Full ARIA compliance

See [GOAL.md](./GOAL.md) for complete roadmap.

## Documentation

- [Architecture overview](./docs/architecture/overview.md)
- [API streaming guide](./docs/api/streaming.md)
- [Database schema](./docs/database/schema.md)
- [Getting started](./docs/development/getting-started.md)
- [Testing strategy](./docs/development/testing.md)
- [Deployment guide](./docs/deployment/cloudflare-setup.md)
- [Troubleshooting](./docs/troubleshooting.md)

## Security

- **Zero secrets in codebase** — all API keys in Cloudflare dashboard only
- **No raw SQL** — Drizzle prevents injection
- **Input validation** — Zod at all boundaries
- **HTTPS by default** on Cloudflare Pages
- **SQLite encryption** at rest in D1

See [security model](./docs/architecture/security-model.md).

## Contributing

1. Follow the coding standards in [CLAUDE.md](./CLAUDE.md)
2. Write tests for all changes (unit + integration or E2E)
3. Use conventional commits
4. Ensure CI passes before opening PR

## License

MIT

## Support

For issues or questions:
- Check [troubleshooting](./docs/troubleshooting.md)
- Open a GitHub issue with reproduction steps
- See [architecture docs](./docs/architecture/overview.md) for design decisions