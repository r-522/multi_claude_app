# Testing Guide

## Test Architecture

| Type | Tool | What it tests |
|------|------|--------------|
| Unit | Vitest | Services, pure functions, MODEL_REGISTRY |
| Integration | Vitest + Miniflare | Repositories against real D1 in-memory |
| Component | Vitest + @testing-library/react | UI components in isolation |
| E2E | Playwright | Full user flows in a real browser |

## Running Tests

```sh
npm run test              # All unit + integration tests
npm run test -- --watch   # Watch mode
npm run test:e2e          # Playwright E2E (requires wrangler dev running)
npx vitest --coverage     # Coverage report
```

## Coverage Thresholds

```
Lines:     80%
Functions: 80%
Branches:  75%
```

Configured in `vitest.config.ts`. CI fails if coverage drops below threshold.

## Unit Test Pattern (Services)

```typescript
// app/features/chat/services/ChatService.test.ts
import { describe, it, expect, vi } from "vitest";
import { ChatService } from "./ChatService";

const mockConversationRepo = {
  findById: vi.fn(),
  create: vi.fn(),
  // ...
};
const mockMessageRepo = {
  create: vi.fn(),
  listByConversation: vi.fn(),
};

describe("ChatService", () => {
  it("creates a conversation with correct defaults", async () => {
    mockConversationRepo.create.mockResolvedValue({ id: "conv_1", ... });
    const service = new ChatService(mockConversationRepo, mockMessageRepo);
    const conv = await service.createConversation({ model: "claude-sonnet-4-6" });
    expect(conv.model).toBe("claude-sonnet-4-6");
    expect(mockConversationRepo.create).toHaveBeenCalledOnce();
  });
});
```

## Integration Test Pattern (Repositories)

```typescript
// tests/integration/api/ConversationRepository.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { unstable_dev } from "wrangler";
// Or use @cloudflare/vitest-pool-workers for native D1 in tests

describe("ConversationRepository (D1 integration)", () => {
  // Setup: create in-memory D1, apply migrations
  // Test: CRUD operations against real SQLite

  it("saves and retrieves a conversation", async () => {
    const repo = new ConversationRepository(db);
    const created = await repo.create({ model: "claude-sonnet-4-6", userId: "default" });
    const found = await repo.findById(created.id);
    expect(found?.id).toBe(created.id);
  });
});
```

## E2E Test Pattern (Playwright)

```typescript
// tests/e2e/flows/chat.test.ts
import { test, expect } from "@playwright/test";

test("user can send a message and receive streaming response", async ({ page }) => {
  await page.goto("/");
  await page.click('[data-testid="new-conversation"]');
  await page.fill('[data-testid="chat-input"]', "Say hello in one word");
  await page.press('[data-testid="chat-input"]', "Enter");

  // Wait for streaming to complete
  await expect(page.locator('[data-testid="message-assistant"]').last()).toBeVisible();
  await expect(page.locator('[data-testid="streaming-indicator"]')).not.toBeVisible();

  // Message was saved
  await page.reload();
  await expect(page.locator('[data-testid="message-user"]')).toContainText("Say hello");
});
```

## What NOT to Test

- Remix framework internals (routing, loaders)
- Drizzle ORM internals
- Cloudflare Workers runtime behavior
- Third-party UI library behavior (Radix UI)

Focus tests on: business logic in services, data transformations, MODEL_REGISTRY param safety, and full user flows.

## Test Data

Unit tests: use `vi.fn()` mocks for all external dependencies.
Integration tests: create fresh data per test, clean up in `afterEach`.
E2E tests: use a dedicated test D1 database, reset between test suites.
