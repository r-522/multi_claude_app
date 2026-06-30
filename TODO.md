# TODO.md — Implementation Breakdown

Priority: P0 = Blocker, P1 = MVP, P2 = Beta, P3 = v1

---

## Epic 1: Foundation (Week 1) — P0

### Feature 1.1: Project Setup

- [x] Initialize directory with Remix + Cloudflare Pages config
- [x] package.json with all dependencies
- [x] tsconfig.json (strict mode, path aliases)
- [x] vite.config.ts (Tailwind v4 + Cloudflare proxy + Remix)
- [x] wrangler.toml (D1 + KV + R2 bindings)
- [x] drizzle.config.ts
- [x] vitest.config.ts + playwright.config.ts
- [x] .gitignore + .eslintrc.cjs + .prettierrc
- [x] GitHub Actions CI/CD workflow
- [ ] **Install dependencies**: `npm install`
- [ ] Verify `npm run typecheck` passes on empty project

### Feature 1.2: Cloudflare Services Setup

- [ ] Create D1 database: `wrangler d1 create claude-chat-db`
- [ ] Update `wrangler.toml` with database_id
- [ ] Create KV namespace: `wrangler kv namespace create KV`
- [ ] Update `wrangler.toml` with KV id + preview_id
- [ ] Create R2 bucket: `wrangler r2 bucket create claude-chat-logs`
- [ ] Add secrets: `wrangler secret put ANTHROPIC_API_KEY`
- [ ] (Optional) Configure AI Gateway in Cloudflare dashboard
- [ ] Copy `.dev.vars.example` → `.dev.vars` with real key

### Feature 1.3: Design System — P0

- [ ] `app/styles/globals.css` — Tailwind v4 import + custom font tokens
- [ ] `app/shared/components/ui/Button.tsx` — variants: default/ghost/destructive/outline
- [ ] `app/shared/components/ui/Input.tsx`
- [ ] `app/shared/components/ui/Textarea.tsx` — auto-resize
- [ ] `app/shared/components/ui/Select.tsx` — Radix Select wrapper
- [ ] `app/shared/components/ui/Slider.tsx` — Radix Slider for temperature
- [ ] `app/shared/components/ui/Badge.tsx` — variants: default/success/warning/error/muted
- [ ] `app/shared/components/ui/Card.tsx`
- [ ] `app/shared/components/ui/Dialog.tsx` — Radix Dialog wrapper
- [ ] `app/shared/components/ui/Tooltip.tsx` — Radix Tooltip
- [ ] `app/shared/components/ui/Toast.tsx` + `ToastProvider.tsx`
- [ ] `app/shared/components/ui/ScrollArea.tsx` — Radix ScrollArea
- [ ] `app/shared/components/ui/Separator.tsx`
- [ ] `app/shared/components/ui/Skeleton.tsx`
- [ ] `app/shared/components/ui/Tabs.tsx` — Radix Tabs
- [ ] `app/shared/components/ui/Switch.tsx`
- [ ] `app/shared/components/ErrorBoundary.tsx`
- [ ] `app/shared/components/layout/Sidebar.tsx` — collapsible, 220px
- [ ] `app/shared/components/layout/Header.tsx`
- [ ] `app/shared/components/layout/MainContent.tsx`
- [ ] `app/shared/hooks/useTheme.ts` — dark/light toggle + localStorage persist
- [ ] `app/shared/hooks/useKeyboard.ts` — global keyboard shortcut handler
- [ ] Verify dark mode works (`class` strategy on `<html>`)

---

## Epic 2: Shared Infrastructure (Week 1–2) — P0

### Feature 2.1: Shared Types

- [ ] `app/shared/types/env.ts` — Cloudflare `Env` interface (DB, KV, LOGS, secrets)
- [ ] `app/shared/types/claude.ts` — ModelId, ModelConfig, StreamChunk, EffortLevel
- [ ] `app/shared/types/api.ts` — ApiError, ApiSuccess, PaginatedResponse

### Feature 2.2: Error Handling

- [ ] `app/shared/lib/errors.ts` — AppError hierarchy (Claude/DB/Validation/RateLimit errors)
- [ ] `app/shared/lib/utils.ts` — `cn()`, `nanoid()`, `formatTokens()`, `formatDate()`

### Feature 2.3: Claude Library — P0

- [ ] `app/shared/lib/claude/models.ts` — MODEL_REGISTRY + `buildMessageParams()`
  - Capability matrix: temperature, effort, thinking per model
  - Unit tests: wrong params for Opus 4.8 produce no temperature field
- [ ] `app/shared/lib/claude/client.ts` — `createClaudeClient(env)` + AI Gateway injection
- [ ] `app/shared/lib/claude/streaming.ts` — SDK stream → `ReadableStream<StreamChunk>`
  - Handle `stop_reason: "refusal"` explicitly
  - Handle stream interruption (write partial to D1)
- [ ] `app/shared/lib/claude/circuit-breaker.ts` — 3-state (closed/open/half-open)
  - Opens after 5 consecutive errors
  - Half-opens after 30 seconds
  - KV-backed state (survives request boundaries)
- [ ] `app/shared/lib/claude/rate-limiter.ts` — KV token bucket per user
  - Configurable: requests/minute, tokens/minute
  - Returns `retryAfter` seconds when exceeded
- [ ] Unit tests for all claude/ lib functions

### Feature 2.4: Database Layer — P0

- [ ] `app/shared/lib/db/schema.ts` — all 6 Drizzle table definitions
  - conversations, messages, promptEntries, tasks, subTasks, taskLogs
- [ ] `app/shared/lib/db/client.ts` — `createDb(d1: D1Database)` factory
- [ ] `db/migrations/0000_initial.sql` — first migration (via `npm run db:generate`)
- [ ] `app/features/chat/repositories/ConversationRepository.ts`
  - create, findById, listByUserId, updateTitle, softDelete
- [ ] `app/features/chat/repositories/MessageRepository.ts`
  - create, findByConversationId, countByConversationId
- [ ] `app/features/builder/repositories/PromptRepository.ts`
  - create, findById, listByUserId, toggleFavorite, delete
- [ ] `app/features/tasks/repositories/TaskRepository.ts`
  - create, findById, listByUserId, updateStatus, updateCounts
- [ ] `app/features/tasks/repositories/SubTaskRepository.ts`
  - createMany, findByTaskId, updateStatus, updatePhaseOutput, incrementRetry
- [ ] `app/features/tasks/repositories/TaskLogRepository.ts`
  - create, findBySubTaskId
- [ ] Integration tests for all repositories (Miniflare D1)

### Feature 2.5: Logging + KV — P0

- [ ] `app/shared/lib/logger.ts` — structured JSON logger → R2 (via `waitUntil`)
  - Fields: requestId, model, inputTokens, outputTokens, durationMs, error
- [ ] `app/shared/lib/kv/client.ts` — typed KV wrapper with TTL helpers

---

## Epic 3: App Shell (Week 2) — P0

### Feature 3.1: Remix App Entry

- [ ] `app/root.tsx` — HTML shell, ThemeProvider, Toaster, global ErrorBoundary
- [ ] `app/entry.client.tsx` — client hydration
- [ ] `app/entry.server.tsx` — Cloudflare Pages SSR entry (renderToReadableStream)
- [ ] `app/routes/_layout.tsx` — sidebar + main content + theme toggle
  - Nav links: Chat, Prompt Builder, Tasks
  - Sidebar collapses to icon-only at < 768px
- [ ] `npm run dev` → app loads at http://localhost:8788

---

## Epic 4: Chat Feature (Week 2–3) — P1

### Feature 4.1: Chat Types + Schemas

- [ ] `app/features/chat/types/chat.types.ts`
- [ ] `app/features/chat/schemas/chat.schema.ts` — Zod schemas for all API endpoints

### Feature 4.2: Chat Backend

- [ ] `app/features/chat/services/ConversationService.ts`
  - create(userId, title, model), list(userId), rename, softDelete
- [ ] `app/features/chat/services/ChatService.ts`
  - loadHistory(conversationId), buildClaudeMessages(messages)
- [ ] `app/routes/api.chat.stream.ts` — SSE streaming endpoint
  - Validates: conversationId, content, model, systemPrompt, temperature/effort, maxTokens
  - Checks rate limit (KV)
  - Calls `circuitBreaker.execute(client.messages.stream(...))`
  - Pipes StreamChunks as `data: JSON\n\n` to browser
  - Sets headers: `Content-Type: text/event-stream`, `X-Accel-Buffering: no`
  - Saves final message + token counts to D1 after stream completes
- [ ] `app/routes/api.chat.stop.ts` — writes abort flag to KV
- [ ] `app/routes/api.chat.conversation.$id.ts` — CRUD for conversation settings
- [ ] Integration tests for streaming endpoint (mock Claude, real D1)

### Feature 4.3: Chat Frontend

- [ ] `app/routes/_layout.chat.tsx` — loader: list conversations, redirect to latest
- [ ] `app/routes/_layout.chat.$id.tsx` — loader: load conversation + messages
- [ ] `app/features/chat/hooks/useStream.ts` — EventSource + AbortController
- [ ] `app/features/chat/hooks/useChat.ts` — state machine: idle|streaming|stopping|error
- [ ] `app/features/chat/hooks/useConversations.ts` — CRUD with optimistic updates
- [ ] `app/features/chat/hooks/useTokenEstimate.ts` — rough client-side estimate
- [ ] `app/features/chat/components/ChatPanel.tsx` — root container
- [ ] `app/features/chat/components/ConversationSidebar.tsx` — history list
- [ ] `app/features/chat/components/ConversationItem.tsx` — single history entry
- [ ] `app/features/chat/components/MessageList.tsx` — scrollable message container
- [ ] `app/features/chat/components/MessageItem.tsx` — user or assistant message
- [ ] `app/features/chat/components/MessageContent.tsx` — react-markdown + Shiki
- [ ] `app/features/chat/components/ChatInput.tsx` — auto-resize textarea + send/stop
- [ ] `app/features/chat/components/ModelSelector.tsx` — model + adaptive params
  - Shows Temperature slider for Sonnet/Haiku only
  - Shows Effort selector for Sonnet/Opus/Fable only
  - Max tokens input
- [ ] `app/features/chat/components/SystemPromptEditor.tsx` — collapsible
- [ ] `app/features/chat/components/TokenCounter.tsx` — input/output/total display
- [ ] `app/features/chat/components/StreamingIndicator.tsx` — animated dots
- [ ] E2E test: send message → stream → save → display history

---

## Epic 5: Prompt Builder Feature (Week 3) — P1

### Feature 5.1: Builder Backend

- [ ] `app/features/builder/types/builder.types.ts`
- [ ] `app/features/builder/schemas/builder.schema.ts`
- [ ] `app/features/builder/services/BuilderService.ts`
  - `analyze(rawPrompt, env)` → PromptAnalysis
  - `generate(rawPrompt, analysis, env)` → BuiltPrompt
  - Both use Sonnet 4.6 (analyze) and Opus 4.8 (generate) with structured output
- [ ] `app/routes/api.builder.analyze.ts` — POST: rawInput → PromptAnalysis
- [ ] `app/routes/api.builder.generate.ts` — POST: rawInput + analysis → BuiltPrompt (save to D1)
- [ ] Unit tests for BuilderService prompts

### Feature 5.2: Builder Frontend

- [ ] `app/routes/_layout.builder.tsx` — loader: list recent prompt entries
- [ ] `app/features/builder/hooks/useBuilder.ts` — 3-state: idle|analyzing|generating
- [ ] `app/features/builder/hooks/useBuilderHistory.ts`
- [ ] `app/features/builder/components/BuilderPanel.tsx`
- [ ] `app/features/builder/components/InputSection.tsx` — large textarea + char count
- [ ] `app/features/builder/components/AnalysisSection.tsx` — purpose/constraints/etc.
- [ ] `app/features/builder/components/OutputSection.tsx` — Tabs: 4 levels
- [ ] `app/features/builder/components/LevelCard.tsx` — content + copy button
- [ ] `app/features/builder/components/ImprovementPanel.tsx` — improvement reasoning
- [ ] E2E test: paste prompt → analyze → generate → copy output

---

## Epic 6: Tasks Feature (Week 4) — P1

### Feature 6.1: Tasks Backend

- [ ] `app/features/tasks/types/tasks.types.ts`
- [ ] `app/features/tasks/schemas/tasks.schema.ts`
- [ ] `app/features/tasks/services/TaskService.ts`
  - `decompose(goal, model, env)` → SubTask[] (Claude returns JSON array)
  - `executePhase(subTaskId, phase, context, env)` → string output
  - `updateSubTaskStatus(...)` orchestrates D1 updates
- [ ] `app/routes/api.tasks.decompose.ts` — POST: goal → task + subTasks (saved to D1)
- [ ] `app/routes/api.tasks.$id.execute.ts` — POST: { phase, context } → output string
  - Phase "review" returns `{ verdict: "pass"|"fail", reason: string }`
- [ ] `app/routes/api.tasks._index.ts` — GET: list tasks, DELETE: delete task
- [ ] Unit tests for TaskService decomposition + execution prompts

### Feature 6.2: Tasks Frontend

- [ ] `app/routes/_layout.tasks.tsx` — loader: list goals
- [ ] `app/routes/_layout.tasks.$id.tsx` — loader: goal + subTasks + logs
- [ ] `app/features/tasks/hooks/useTasks.ts` — task list state
- [ ] `app/features/tasks/hooks/useTaskExecution.ts` — client-side loop
  - Iterates subTasks sequentially
  - For each: Plan → Execute → Review → (Improve if failed, up to maxRetries)
  - Updates D1 via API after each phase
  - Handles pause/resume
- [ ] `app/features/tasks/hooks/useTaskLogs.ts` — poll logs during execution
- [ ] `app/features/tasks/components/TasksPanel.tsx`
- [ ] `app/features/tasks/components/GoalInput.tsx` — textarea + model selector + submit
- [ ] `app/features/tasks/components/TaskList.tsx` — ordered sub-task list
- [ ] `app/features/tasks/components/TaskItem.tsx` — expandable card
- [ ] `app/features/tasks/components/TaskStateIndicator.tsx` — animated badge
- [ ] `app/features/tasks/components/TaskLog.tsx` — phase-labeled log entries
- [ ] `app/features/tasks/components/TaskProgress.tsx` — progress bar + counts
- [ ] `app/features/tasks/components/ExecutionControls.tsx` — start/pause/reset
- [ ] E2E test: enter goal → decompose → start → complete all sub-tasks

---

## Epic 7: Harness Engineering + Docs (Week 4–5) — P1

### Feature 7.1: CLAUDE.md (done above)

### Feature 7.2: Skills

- [x] `CLAUDE.md` structure documenting all skills
- [ ] `.claude/skills/architecture/SKILL.md`
- [ ] `.claude/skills/frontend/SKILL.md`
- [ ] `.claude/skills/backend/SKILL.md`
- [ ] `.claude/skills/api-design/SKILL.md`
- [ ] `.claude/skills/cloudflare/SKILL.md`
- [ ] `.claude/skills/testing/SKILL.md`
- [ ] `.claude/skills/deployment/SKILL.md`
- [ ] `.claude/skills/security/SKILL.md`
- [ ] `.claude/skills/prompt-engineering/SKILL.md`
- [ ] `.claude/skills/reviewer/SKILL.md`
- [ ] `.claude/skills/refactoring/SKILL.md`
- [ ] `.claude/skills/documentation/SKILL.md`
- [ ] `.claude/skills/task-loop/SKILL.md`
- [ ] `.claude/skills/research/SKILL.md`
- [ ] `.claude/skills/debug/SKILL.md`

### Feature 7.3: Documentation

- [ ] `docs/architecture/overview.md` (with Mermaid C4 diagram)
- [ ] `docs/architecture/data-flow.md` (with Mermaid sequence diagrams)
- [ ] `docs/architecture/cloudflare-services.md`
- [ ] `docs/architecture/security-model.md`
- [ ] `docs/features/chat.md`
- [ ] `docs/features/prompt-builder.md`
- [ ] `docs/features/tasks.md`
- [ ] `docs/api/claude-integration.md`
- [ ] `docs/api/streaming.md`
- [ ] `docs/api/model-capabilities.md`
- [ ] `docs/database/schema.md` (with Mermaid ER diagram)
- [ ] `docs/database/migrations.md`
- [ ] `docs/deployment/cloudflare-setup.md`
- [ ] `docs/deployment/env-vars.md`
- [ ] `docs/deployment/ci-cd.md`
- [ ] `docs/development/getting-started.md`
- [ ] `docs/development/coding-standards.md`
- [ ] `docs/development/testing.md`
- [ ] `docs/adr/001-framework-remix.md`
- [ ] `docs/adr/002-database-d1-drizzle.md`
- [ ] `docs/adr/003-streaming-sse.md`
- [ ] `docs/adr/004-auth-single-user.md`
- [ ] `docs/adr/005-task-execution-client-loop.md`
- [ ] `docs/adr/006-ui-radix-custom.md`
- [ ] `docs/adr/007-ai-gateway-proxy.md`
- [ ] `docs/troubleshooting.md`
- [ ] `docs/token-usage.md`

---

## Epic 8: Polish + Security (Week 5) — P1/P2

- [ ] `public/_headers` — CSP headers for all routes
- [ ] Rate limiting audit: all Claude-calling routes protected
- [ ] Input sanitization audit (Zod schemas reviewed)
- [ ] Accessibility: all interactive elements have ARIA labels
- [ ] Keyboard navigation: all features usable without mouse
- [ ] Mobile responsive layout (test at 320px, 768px, 1280px)
- [ ] Lighthouse audit: score ≥ 85 on all pages
- [ ] Final E2E test run: all 3 features pass

---

## Epic 9: Deployment (Week 5) — P1

- [ ] `wrangler d1 migrations apply DB --remote` — apply migrations to production
- [ ] `npm run deploy` — deploy to Cloudflare Pages
- [ ] Configure custom domain in Cloudflare Pages dashboard
- [ ] Verify production: all 3 screens work
- [ ] Verify AI Gateway logs appear in Cloudflare dashboard
- [ ] Smoke test: send real message, build prompt, run task
