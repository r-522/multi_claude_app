# Skill: reviewer

## Description
Conduct thorough code reviews with focus on correctness, security, and architectural patterns.

## When to Use
- Reviewing PRs before merge
- Conducting security audits of API routes
- Reviewing Claude API parameter correctness
- Checking error handling completeness
- Reviewing database schema changes

## Review Checklist

### Security
- [ ] No secrets hardcoded or in version-controlled files
- [ ] All user input validated with Zod at route entry
- [ ] Error responses don't expose stack traces
- [ ] Rate limiting present on Claude-calling routes
- [ ] New D1 queries use Drizzle parameterization (no raw SQL injection vectors)

### Claude API Correctness
- [ ] All Claude params built via `buildMessageParams()` — no manual construction
- [ ] `stop_reason: "refusal"` handled explicitly in streaming routes
- [ ] Streaming routes set `X-Accel-Buffering: no`
- [ ] Model IDs are from `MODEL_REGISTRY` constants — no hardcoded strings
- [ ] `thinking: { type: "disabled" }` not sent to Fable 5 (returns 400)

### Architecture
- [ ] Routes are thin: validate → service call → response (no business logic in routes)
- [ ] No Drizzle imports in route files (only through repositories)
- [ ] Cross-feature imports don't exist (features only import from `~/shared/`)
- [ ] File length ≤ 200 lines

### Error Handling
- [ ] Every async operation has a visible error state in the UI
- [ ] Errors are wrapped in `AppError` subclasses before returning
- [ ] Partial stream failures save partial content to D1

### Tests
- [ ] New service methods have unit tests
- [ ] New repository methods have integration tests
- [ ] New user flows have E2E test coverage

## Failure Handling
- Multiple review issues found: prioritize P0 (security/correctness bugs) over P1 (architectural)
- Large PR: request splitting into smaller PRs if review confidence is low

## Examples
```typescript
// BAD: manual Claude params (temperature on Opus 4.8 = 400 error)
const response = await claude.messages.create({
  model: "claude-opus-4-8",
  temperature: 0.7,  // ← WRONG: Opus 4.8 doesn't support temperature
  max_tokens: 1000,
  messages: [...]
});

// GOOD: use buildMessageParams
const params = buildMessageParams(MODEL_REGISTRY["claude-opus-4-8"], {
  messages: [...],
  maxTokens: 1000,
  effort: "high"
});
const response = await claude.messages.stream(params);
```
