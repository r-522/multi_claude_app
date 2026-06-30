# Claude API Integration

## Overview

All Claude API calls go through `app/shared/lib/claude/`. Routes never import `@anthropic-ai/sdk` directly.

```
Route → Service → Claude Client (circuit-breaker wrapped) → AI Gateway → Anthropic
```

## Client Factory

```typescript
// app/shared/lib/claude/client.ts
import Anthropic from "@anthropic-ai/sdk";
import type { Env } from "~/shared/types/env";

export function createClaudeClient(env: Env): Anthropic {
  return new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
    baseURL: env.AI_GATEWAY_URL,
    defaultHeaders: {
      "cf-aig-authorization": `Bearer ${env.AI_GATEWAY_TOKEN}`,
    },
    maxRetries: 0, // Circuit breaker handles retry logic
  });
}
```

## buildMessageParams — Safe Parameter Construction

The only sanctioned way to build Claude API call parameters. Ensures model-specific constraints are respected.

```typescript
export function buildMessageParams(
  model: ModelConfig,
  opts: {
    messages: CoreMessage[];
    systemPrompt?: string;
    maxTokens?: number;
    temperature?: number;
    effort?: EffortLevel;
    thinking?: boolean;
  }
): Anthropic.Messages.MessageCreateParamsNonStreaming {
  const params: Anthropic.Messages.MessageCreateParamsNonStreaming = {
    model: model.id,
    max_tokens: opts.maxTokens ?? model.maxOutputTokens,
    messages: opts.messages,
  };

  if (opts.systemPrompt) {
    params.system = opts.systemPrompt;
  }

  // Temperature: only Sonnet 4.6 and Haiku 4.5
  if (model.supportsTemperature && opts.temperature !== undefined) {
    params.temperature = opts.temperature;
  }

  // Effort: not available on Haiku 4.5; xhigh only on Opus 4.8 and Fable 5
  if (model.supportsEffort && opts.effort) {
    if (opts.effort === "xhigh" && !model.supportsXHighEffort) {
      params.output_config = { effort: "high" }; // Downgrade silently
    } else {
      params.output_config = { effort: opts.effort };
    }
  }

  // Thinking: optional on Opus 4.8 and Sonnet 4.6; always-on on Fable 5 (never send param)
  // Never send thinking: { type: "disabled" } to Fable 5 — returns 400
  if (model.supportsThinking && opts.thinking) {
    params.thinking = { type: "enabled", budget_tokens: 10000 };
  }

  return params;
}
```

## Circuit Breaker

Three-state circuit breaker backed by KV. Wraps all Claude API calls.

```
Closed (normal) → failures >= threshold → Open (blocking)
Open → after cooldown → Half-Open (probe)
Half-Open → success → Closed | failure → Open
```

```typescript
// Usage in route
const cb = new CircuitBreaker(env.KV, "circuit:claude");
const result = await cb.execute(async () => {
  return claude.messages.stream(params);
});
```

Circuit state stored in KV: `{ state: "closed"|"open"|"half-open", failures: N, openedAt: ISO }`.

## Rate Limiter

Token bucket per `userId`, backed by KV. Checked before every Claude API call.

```typescript
const limiter = new RateLimiter(env.KV, userId);
const result = await limiter.check({ tokensPerMinute: 20, burst: 5 });
if (!result.allowed) {
  throw new RateLimitError(result.retryAfter);
}
```

## Error Mapping

| Anthropic Error | App Error Class | HTTP Status |
|----------------|----------------|------------|
| 400 Bad Request | `ClaudeParamError` | 500 (these are bugs) |
| 401 Unauthorized | `ClaudeAuthError` | 500 |
| 429 Rate Limited | `ClaudeRateLimitError` | 429 |
| 500/529 Overloaded | `ClaudeOverloadError` | 503 |
| `stop_reason: "refusal"` | `ClaudeRefusalError` | 200 (user-friendly message) |
| Circuit open | `ClaudeCircuitOpenError` | 503 |

```typescript
// Refusal is NOT an error — handle as a valid response
if (message.stop_reason === "refusal") {
  return json({
    content: "I can't help with that request.",
    stopReason: "refusal",
  });
}
```
