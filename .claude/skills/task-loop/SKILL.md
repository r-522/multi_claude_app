# Skill: task-loop

## Description
Work with the Tasks feature's Plan→Execute→Review→Improve execution loop.

## When to Use
- Debugging task execution failures (sub-task stuck in "doing", never resolving)
- Improving the per-phase prompts (decompose, plan, execute, review, improve)
- Changing retry logic or state machine transitions
- Designing new task types or extending the phase model
- Understanding how the client-side loop interacts with the API

## Architecture Overview

```
useTaskExecution (client-side loop)
  → iterates subTasks sequentially
  For each subTask:
    PATCH status = "doing"
    POST /api/tasks/:id/execute { phase: "plan" }
    → save planOutput to D1
    POST /api/tasks/:id/execute { phase: "execute", plan }
    → save executeOutput to D1
    POST /api/tasks/:id/execute { phase: "review", plan, execute }
    → returns { verdict: "pass"|"fail", reason }
    if verdict = "fail" and retryCount < maxRetries:
      POST /api/tasks/:id/execute { phase: "improve", plan, execute, reason }
      → loop back to execute with improved context
    PATCH status = "done" | "failed"
  → PATCH task.status = "completed"
```

## State Machine

```
Todo → Doing → Done
            ↓ (review: fail)
           Retry → (retryCount < maxRetries) → back to Doing
            ↓ (retryCount >= maxRetries)
           Failed
```

## Best Practices
- Each phase is a separate API call — don't combine phases in one call (degrades quality)
- Review phase prompt: force binary verdict `pass | fail` + specific reason
- All phase outputs saved to D1 before advancing to next phase (crash-safe)
- `maxRetries = 2` by default — enough for genuine improvement, not infinite loops
- Improve prompt: pass the review reason explicitly so Claude knows what to fix
- Task logs written after each phase transition: `{ phase, level: "info", message }`
- Pause: set a KV flag `task-paused:{taskId}`, check in loop before each phase call

## Failure Handling
- Sub-task stuck in "doing": check if API route timed out or threw unhandled error
- Review always returns "fail": review prompt may be too strict; adjust criteria
- Decompose returns too many sub-tasks (> 8): add explicit constraint in decompose prompt
- Claude output not valid JSON: add explicit JSON-only instruction in system prompt

## v1 Upgrade Path (Durable Objects)
When tasks need to survive browser close:
1. Replace `useTaskExecution` with a Durable Object class
2. Client sends goal → gets back taskId
3. DO manages state, calls API phases, stores to D1
4. Client polls `/api/tasks/:id` for status updates
5. KV flag replaces client-side pause control

## Examples
- Task "Build a REST API for user auth": decomposes into design schema, create endpoints, write tests, add auth middleware
- Review prompt: "Did the execute output accomplish this task: {description}? Answer pass if complete and correct, fail if not."
