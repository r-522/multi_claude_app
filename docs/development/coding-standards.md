# Coding Standards

## TypeScript

- Strict mode always on (`"strict": true`, `"noUncheckedIndexedAccess": true`)
- No `any` — use `unknown` + type narrowing, or a specific type
- Prefer `type` over `interface` for data shapes; `interface` for classes
- Export types explicitly — don't rely on structural inference across module boundaries
- Use Zod for runtime validation; derive TypeScript types from Zod schemas

```typescript
// ✅
const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});
type Message = z.infer<typeof MessageSchema>;

// ✗
interface Message {
  id: string;
  role: string;  // too loose
  content: any;  // never any
}
```

## Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Files | kebab-case | `chat-service.ts` |
| Components | PascalCase | `MessageItem.tsx` |
| Hooks | camelCase, `use` prefix | `useStream.ts` |
| Services | PascalCase, `Service` suffix | `ChatService.ts` |
| Repositories | PascalCase, `Repository` suffix | `MessageRepository.ts` |
| Schemas | camelCase, `Schema` suffix | `MessageSchema` |
| Types | PascalCase | `StreamChunk` |
| Constants | SCREAMING_SNAKE_CASE | `MODEL_REGISTRY` |
| CSS classes | Tailwind utility classes | `className="flex items-center gap-2"` |

## Import Order

1. Node built-ins
2. External packages (`react`, `@anthropic-ai/sdk`)
3. Remix modules (`~/routes`, `~/features`, `~/shared`)
4. Relative imports (`./ChatService`)

Use `~/` alias for `app/` directory imports — never relative `../../` from deep nesting.

## Component Rules

- No business logic in components — delegate to hooks and services
- Props are TypeScript types, not interfaces
- `data-testid` attributes on all interactive elements (for E2E tests)
- No inline styles — use Tailwind classes
- Dark mode: use `dark:` variant, never hardcode light/dark colors

```tsx
// ✅
export function MessageItem({ message }: { message: Message }) {
  return (
    <div
      className="flex gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
      data-testid="message-item"
    >
      <MessageContent content={message.content} />
    </div>
  );
}
```

## Route Rules

Routes must be thin — validate input, call one service method, return response. No business logic.

```typescript
// ✅ Thin route
export async function action({ request, context }: ActionFunctionArgs) {
  const env = context.cloudflare.env;
  const body = ChatStreamRequestSchema.parse(await request.json());
  const service = new ChatService(env);
  return service.streamResponse(body); // Returns Response directly
}

// ✗ Fat route — business logic in route
export async function action({ request, context }: ActionFunctionArgs) {
  const db = createDb(context.cloudflare.env.DB);
  const messages = await db.select().from(messagesTable)...; // belongs in repo
  // ... 50 more lines of business logic
}
```

## Error Handling

- Wrap all Claude API errors in `AppError` subclasses (see `app/shared/lib/errors.ts`)
- Never swallow errors silently
- Every `async` function either returns a typed result or throws an `AppError`
- Routes convert `AppError` to HTTP responses; components handle `error` state

## File Length

Max 200 lines per file. If a file exceeds 200 lines:
- Extract sub-components to separate files
- Extract helper functions to utils
- Extract data operations to a repository

## Comments

Default: no comments. Add a comment only when the WHY is non-obvious — a workaround, a constraint from a third-party limitation, or a subtle invariant. Never explain WHAT the code does.
