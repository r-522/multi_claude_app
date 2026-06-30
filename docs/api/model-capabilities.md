# Model Capabilities Reference

## Capability Matrix

| Model ID | Temp | Effort | Thinking | Context | Max Output | Best For |
|----------|------|--------|----------|---------|-----------|---------|
| `claude-fable-5` | ❌ 400 | ✅ xhigh/max | Always on (adaptive) | 1M | 128K | Complex reasoning, research |
| `claude-opus-4-8` | ❌ 400 | ✅ xhigh/max | Optional | 1M | 128K | Complex generation, code |
| `claude-sonnet-4-6` | ✅ | ✅ no xhigh | Optional | 1M | 64K | Default — best quality/cost |
| `claude-haiku-4-5-20251001` | ✅ | ❌ 400 | ❌ | 200K | 64K | Fast, cheap, structured output |

**Critical:** Sending disallowed params returns 400. Always use `buildMessageParams()`.

## MODEL_REGISTRY Definition

```typescript
// app/shared/lib/claude/models.ts
export const MODEL_REGISTRY: Record<ModelId, ModelConfig> = {
  "claude-fable-5": {
    id: "claude-fable-5",
    displayName: "Fable 5",
    supportsTemperature: false,
    supportsEffort: true,
    supportsXHighEffort: true,
    supportsThinking: false, // always-on adaptive; do NOT send thinking param
    contextWindow: 1_000_000,
    maxOutputTokens: 131_072,
  },
  "claude-opus-4-8": {
    id: "claude-opus-4-8",
    displayName: "Opus 4.8",
    supportsTemperature: false,
    supportsEffort: true,
    supportsXHighEffort: true,
    supportsThinking: true,
    contextWindow: 1_000_000,
    maxOutputTokens: 131_072,
  },
  "claude-sonnet-4-6": {
    id: "claude-sonnet-4-6",
    displayName: "Sonnet 4.6",
    supportsTemperature: true,
    supportsEffort: true,
    supportsXHighEffort: false,
    supportsThinking: true,
    contextWindow: 1_000_000,
    maxOutputTokens: 65_536,
  },
  "claude-haiku-4-5-20251001": {
    id: "claude-haiku-4-5-20251001",
    displayName: "Haiku 4.5",
    supportsTemperature: true,
    supportsEffort: false,
    supportsXHighEffort: false,
    supportsThinking: false,
    contextWindow: 200_000,
    maxOutputTokens: 65_536,
  },
};
```

## Effort Levels

| Level | Available On | Use Case |
|-------|-------------|---------|
| `low` | Sonnet, Opus, Fable | Fast responses, simple tasks |
| `medium` | Sonnet, Opus, Fable | Structured output generation |
| `high` | Sonnet, Opus, Fable | Quality chat, code review |
| `xhigh` | Opus, Fable only | Complex reasoning, task execution |
| `max` | Opus, Fable only | Maximum reasoning budget |

Effort replaces `budget_tokens` — never use `budget_tokens` directly.

## Cost Guidance (relative)

```
Haiku:  1x   (cheapest — use for classification, structured output)
Sonnet: ~5x  (default — best quality/cost for interactive use)
Opus:   ~15x (reserved for complex generation and task execution)
Fable:  ~20x (highest capability — use for research-grade output)
```

## Default Model Per Feature

| Feature | Default Model | Effort | Reason |
|---------|-------------|--------|--------|
| Chat | claude-sonnet-4-6 | high | Best interactive experience |
| Builder — analyze | claude-sonnet-4-6 | medium | Fast structured output |
| Builder — generate | claude-opus-4-8 | high | Quality output |
| Task decompose | claude-sonnet-4-6 | medium | JSON output, fast |
| Task execute | claude-opus-4-8 | xhigh | Best reasoning |
| Task review | claude-sonnet-4-6 | high | Clear verdict |
