# Skill: refactoring

## Description
Refactor code to improve clarity, reduce duplication, and enforce vertical slice patterns.

## When to Use
- Files over 200 lines that need decomposition
- Duplicate logic across features that should be extracted to shared/
- Services that have grown to contain repository concerns
- Components mixing UI rendering and data-fetching logic
- Route files containing business logic

## Workflow
1. Ensure existing tests pass (green before, green after is the contract)
2. Identify the refactoring target: what single concern is out of place?
3. Extract one concern at a time — don't refactor everything at once
4. Update imports and verify TypeScript compilation
5. Run tests — must remain green

## Best Practices
- Extract to `app/shared/` only when 3+ features need the same logic
- Keep public interfaces stable when refactoring internals
- Never combine refactoring with feature additions in the same PR
- File decomposition: split by concern (rendering vs. logic vs. data)
- Service decomposition: extract DB operations to a repository class

## Common Refactoring Patterns

### Route too long → Extract service method
```typescript
// Before: business logic in route loader
export async function loader({ context }) {
  const db = createDb(context.cloudflare.env.DB);
  const messages = await db.select()...  // ← belongs in repository
  const claudeParams = buildMessages(messages);  // ← belongs in service
  return json({ messages });
}

// After: route delegates to service
export async function loader({ context }) {
  const service = new ChatService(context.cloudflare.env);
  return json({ messages: await service.loadHistory(conversationId) });
}
```

### Component too large → Extract sub-components
```typescript
// Split by: what data does it need? If different → separate component
// MessageList renders list + virtualization
// MessageItem renders a single message
// MessageContent renders markdown + code highlight
```

### Duplicated data transformation → Extract to shared/lib/utils
```typescript
// If 2+ features format tokens the same way → ~/shared/lib/utils.formatTokens()
```

## Failure Handling
- TypeScript errors after refactor: fix all before committing — never leave type errors as "TODO"
- Tests broken by refactor: fix them before moving on; broken tests → hidden regressions
- Circular imports after extraction: shared/ must not import from features/; check dependency direction
