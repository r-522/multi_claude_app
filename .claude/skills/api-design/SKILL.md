# Skill: api-design

## Description
Design and review API contracts between client and server in this Remix application.

## When to Use
- Defining new API route shapes (request body, response shape)
- Writing or reviewing Zod schemas in `app/features/*/schemas/`
- Designing the SSE streaming protocol additions
- Reviewing error response formats for consistency

## Workflow
1. Define Zod schema for request first — drives TypeScript types
2. Define Zod schema for success response
3. Implement route handler to match both schemas
4. Document in `docs/api/` if it's a significant new endpoint

## Best Practices
- Every API route has a Zod schema for input validation and output shaping
- Success: `{ data: T }` or direct T (for simple responses)
- Error: `{ error: { code: string; message: string; fields?: Record<string, string> } }`
- SSE chunks: `data: JSON\n\n` format — always include `type` discriminator field
- HTTP status codes: 200 (ok), 201 (created), 400 (validation), 429 (rate limit), 500 (server)
- Streaming endpoint URLs: `api.{feature}.stream` (e.g., `api.chat.stream`)
- No breaking changes to existing response shapes without versioning or deprecation notice

## StreamChunk Discriminated Union
```typescript
type StreamChunk =
  | { type: "delta"; content: string }
  | { type: "thinking"; thinking: string }
  | { type: "done"; inputTokens: number; outputTokens: number; stopReason: string }
  | { type: "error"; code: string; message: string; retryable: boolean };
```

## Failure Handling
- Never expose stack traces or internal error details in API responses
- Validation errors: include `fields` map for per-field error messages
- Unhandled errors → log to R2 with requestId → return generic 500

## Examples
- Chat stream endpoint: POST body `{ conversationId, content, model, options }` → SSE stream
- Builder analyze: POST body `{ rawInput, model? }` → `{ analysis: PromptAnalysis }`
- Task execute: POST body `{ phase, plan?, execute?, review? }` → `{ output: string }` or `{ verdict, reason }`
