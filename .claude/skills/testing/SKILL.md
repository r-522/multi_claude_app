# Skill: testing

## Description
Write and review unit, integration, and E2E tests for this codebase.

## When to Use
- Writing tests for new service methods or repository queries
- Writing integration tests against real Miniflare D1
- Writing Playwright E2E tests for user flows
- Reviewing test coverage gaps
- Debugging flaky tests

## Workflow
1. Unit tests: test service in `tests/unit/features/{feature}/` with mocked dependencies
2. Integration tests: test repository in `tests/integration/` with Miniflare D1
3. E2E tests: test full user flow in `tests/e2e/flows/` with Playwright
4. Run `npm run test` before committing; CI runs all three levels

## Test Patterns

### Unit Test (Service)
```typescript
// Mock Claude at the service boundary
const mockClaude = {
  messages: { create: vi.fn() }
};
// Never mock Drizzle — use real in-memory D1 instead
```

### Integration Test (Repository)
```typescript
import { Miniflare } from "miniflare";
// Uses real SQLite — no mocks. Migrations applied before each test file.
```

### E2E Test (Playwright)
```typescript
// Test happy path + key error states
// Use data-testid attributes for selectors (no brittle CSS selectors)
test("chat sends message and streams response", async ({ page }) => {
  await page.goto("/chat");
  await page.getByTestId("chat-input").fill("Hello");
  await page.getByTestId("send-button").click();
  await expect(page.getByTestId("message-streaming")).toBeVisible();
});
```

## Best Practices
- Mock Claude at service boundary: `const claude = { messages: { create: mockFn } }`
- Never mock Drizzle — integration tests use real Miniflare D1
- E2E tests cover: happy path, error state (Claude timeout), keyboard navigation
- Test files colocated with source: `ServiceName.test.ts` in same directory
- Use `data-testid` attributes in components for stable E2E selectors
- Coverage thresholds: 80% lines/functions enforced in CI

## Failure Handling
- Integration test D1 setup fails: ensure Miniflare version matches wrangler version
- Playwright timeout: check `webServer.url` matches actual dev server port (8788)
- Flaky streaming test: use `waitForResponse` with timeout, not `waitForTimeout`

## Examples
- Test `buildMessageParams("claude-opus-4-8", { temperature: 0.5 })` → no `temperature` field
- Test conversation CRUD with Miniflare D1 → all methods return correct types
- E2E test builder: paste prompt → click Analyze → loading indicator → results appear
