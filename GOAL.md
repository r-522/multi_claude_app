# GOAL.md — Product Milestones

## MVP (Target: 5 weeks from start)

A fully working personal developer tool deployed to Cloudflare Pages.
Quality bar: a developer can use it daily without frustration.

### Done Criteria

- [ ] **Chat**: Stream messages with visible token-by-token output. Switch models (Sonnet/Opus/Haiku/Fable). View and switch conversation history. Set system prompt. Adjust temperature (model-appropriate). Copy messages. Regenerate last response. Stop mid-stream. Token count visible.
- [ ] **Prompt Builder**: Paste raw prompt → analyze (purpose/constraints/output/gaps/improvements). Generate 4-level output (Simple/Standard/Professional/Research). Copy any level. View improvement reasoning.
- [ ] **Tasks**: Input goal → AI decomposes into ordered sub-tasks. Execute Plan→Execute→Review loop for each sub-task. View real-time status per task (Todo/Doing/Done/Failed/Retry). Read per-task logs. Pause and resume execution.
- [ ] **Models work correctly**: No 400 errors from wrong params. Temperature hidden for Opus 4.8 / Fable 5. Effort selector shown for supported models.
- [ ] **Deployed**: Live on Cloudflare Pages with custom domain + SSL. All 3 screens accessible.
- [ ] **Secure**: Zero secrets in codebase. API key in Cloudflare secrets only.
- [ ] **Tests**: Core E2E tests passing for all three happy paths.

### Quality Acceptance Criteria

- First message response begins streaming within 3 seconds on good connection
- No JavaScript errors in browser console on normal usage
- Dark mode functions on all three screens
- All interactive elements reachable via keyboard

---

## Beta (Target: +3 weeks)

Quality, reliability, and observability improvements.

### Done Criteria

- [ ] Circuit breaker and rate limiter verified under load
- [ ] R2 structured logging for all Claude API calls
- [ ] KV caching for conversation list (sub-100ms loads)
- [ ] Syntax highlighting for TypeScript, Python, JavaScript, Bash, SQL, JSON, HTML, CSS
- [ ] Full keyboard navigation (chat, builder, tasks — all features usable without mouse)
- [ ] Mobile-responsive layout (320px–1920px)
- [ ] 80%+ unit + integration test coverage
- [ ] Error states visible for all async operations

---

## v1 (Target: +6 weeks from Beta)

Performance and architecture upgrades. Background task execution.

### Done Criteria

- [ ] Durable Objects for background task execution (tasks survive tab close)
- [ ] Cloudflare Queues for async task distribution
- [ ] Conversation export (Markdown format)
- [ ] Prompt builder history with search + favorites
- [ ] Task templates (save and reuse goal templates)
- [ ] Token usage analytics page (total spend, per-model breakdown)
- [ ] Full ARIA compliance — passes axe-core audit with zero violations
- [ ] Performance: Lighthouse score ≥ 90 on all pages

---

## v2 (Target: +8 weeks from v1)

Multi-user capability.

### Done Criteria

- [ ] Authentication (Cloudflare Access or custom JWT)
- [ ] Per-user data isolation (`userId` propagated to all queries)
- [ ] Shared conversations (read-only share links via R2 + signed URL)
- [ ] BYOK — per-user Anthropic API key (stored encrypted in KV)
- [ ] Advanced task orchestration (parallel sub-tasks via Durable Objects)
- [ ] Prompt builder team library (shared organization-level prompts)

---

## Future / Backlog

- Real-time collaboration on conversations
- Browser extension for context injection
- Webhook support for task completion notifications
- Custom fine-tuned system prompt templates per use case
- Token budget alerts (email/Slack when spend exceeds threshold)
- Cloudflare AI Gateway semantic caching for repeated prompts
