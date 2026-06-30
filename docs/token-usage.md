# Token Usage Guide

## Overview

All Claude API calls are logged with token counts. Use this guide to understand cost drivers and optimize usage.

## Token Counting Per Feature

### Chat

| Event | Tokens Consumed |
|-------|----------------|
| User sends message | All previous messages + system prompt + new message (input) + response (output) |
| Regenerate | Same as above — full context resent |
| System prompt change | No charge until next message |

Token counts are visible per-message in the UI and as a running total per conversation.

### Prompt Builder

| Phase | Model | Estimated Cost |
|-------|-------|---------------|
| Analyze | Sonnet 4.6 | ~500 input, ~300 output per analysis |
| Generate | Opus 4.8 | ~800 input, ~2000 output (4 levels + reasoning) |

One full build run costs approximately: Sonnet analysis (~$0.005) + Opus generation (~$0.10).

### Tasks

| Phase | Model | Notes |
|-------|-------|-------|
| Decompose | Sonnet 4.6 | Once per goal, cheap |
| Plan | Opus 4.8 | Once per sub-task |
| Execute | Opus 4.8 | Most expensive — largest output |
| Review | Sonnet 4.6 | Short output (verdict + reason) |
| Improve | Opus 4.8 | Only on retry, up to maxRetries times |

A 5-sub-task run with 0 retries costs approximately: ~$0.50–$2.00 depending on output length.

## Context Window Management

As conversations grow, input tokens increase. Strategies:

1. **Conversation summarization** (v1): when a conversation exceeds 100K input tokens, summarize older messages with Claude before continuing
2. **Context window display**: UI shows current estimated context usage against model limit
3. **Sliding window** (v1): optionally include only the last N messages in API calls

## Token Display in UI

- Chat: token counter shows `↑ input_tokens ↓ output_tokens` per message
- Conversation header: total tokens used for the session
- Tasks: each sub-task shows total tokens consumed across all phases
- Builder: shows input + output for each phase

## Reducing Costs

- Use Haiku 4.5 for classification tasks (Task review verdict is a good candidate)
- Cache Builder analysis results (same prompt → KV cache → skip Sonnet call)
- Use effort: "medium" instead of "high" for non-critical generation
- Stop task execution early if review consistently fails (adjust prompts instead of burning retries)

## Log Access

All token usage is logged to R2 at `logs/{year}/{month}/{day}/{requestId}.json`. Query with:
```sh
wrangler r2 object get claude-chat-logs logs/2026/01/15/req_abc123.json
```

AI Gateway dashboard also shows token usage aggregated by model and endpoint.
