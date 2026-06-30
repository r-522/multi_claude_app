# ADR-005: Task Execution — Client-Side Loop for MVP

## Status
Accepted

## Context

The Tasks feature requires a Plan→Execute→Review→Improve loop that runs multiple sequential Claude API calls (4–20+ per goal). This must:
- Survive long execution (minutes, potentially)
- Show live progress to the user
- Persist state so a browser refresh doesn't restart execution
- Allow pause/resume

Options:
- **Client-side loop (browser hook)**: `useTaskExecution` React hook drives the loop, calling the API per phase
- **Durable Objects**: Persistent actor per task, manages state machine, calls Claude API, survives tab close
- **Workers Queues**: Async processing, but no real-time progress visibility without polling
- **Cron trigger**: Batch processing model, not suitable for interactive use

The key constraint: Cloudflare Workers have a 50ms CPU time limit per request (Paid plan extends this, but streaming routes bypass it via Workers Streaming). A long-running loop can't live in a single Worker invocation.

## Decision

**Client-side loop for MVP, Durable Objects for v1.**

The browser manages the state machine. For each sub-task, the client calls `/api/tasks/:id/execute` once per phase. Each API call is a short Workers invocation. The loop state lives in React state and is persisted to D1 after each phase — refreshing the page recovers in-progress work.

Durable Objects are deferred to v1. They solve the "tab close" problem but add significant complexity (DO deployment, state serialization, SSE/polling client).

## Consequences

**Good:**
- No Durable Objects complexity in MVP
- Real-time progress is native (React state updates immediately)
- Crash recovery is free (D1 persists each phase's output)
- Pause/resume is a simple KV flag + React state check

**Bad:**
- Tasks fail if the tab is closed during execution (acceptable for MVP personal tool)
- Long tasks (10+ sub-tasks × 4 phases) require the browser to stay open
- Concurrency limited to one active task per session (browser manages the loop)

## v1 Upgrade Path

1. Create a Durable Object class `TaskExecutor`
2. Move `useTaskExecution` logic into the DO (same phase API calls)
3. Client sends goal → receives taskId → subscribes to SSE progress stream from DO
4. DO writes all phase outputs to D1 (same schema, no migration)
5. KV pause flag replaced by DO internal state
