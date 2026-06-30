# Feature: Prompt Builder

## Overview

The Prompt Builder transforms a raw, rough prompt into four refined versions (Simple, Standard, Professional, Research). It first analyzes the prompt to identify intent, gaps, and constraints, then generates all four versions with improvement reasoning. Users can copy any version directly to the clipboard or send it to Chat.

## Data Flow

See `docs/architecture/data-flow.md` → "Feature 2: Prompt Builder — Two-Phase".

## Two-Phase Design

### Phase 1: Analysis (Sonnet 4.6, effort: medium)

Input: raw prompt text

Output (`PromptAnalysis`):
```typescript
type PromptAnalysis = {
  purpose: string;           // What the prompt is trying to accomplish
  constraints: string[];     // Explicit and implicit constraints
  expectedOutput: string;    // What a good response would look like
  missingInfo: string[];     // Information that would improve the prompt
  improvements: string[];    // Specific improvement suggestions
};
```

### Phase 2: Generation (Opus 4.8, effort: high)

Input: raw prompt + analysis

Output (`BuiltPrompt`):
```typescript
type BuiltPrompt = {
  promptId: string;
  simple: string;         // Direct, minimal, no fluff
  standard: string;       // Clear structure, common use
  professional: string;   // Formal, complete, production-ready
  research: string;       // Academic rigor, explicit methodology
  reasoning: string;      // Explanation of key decisions made
};
```

## Data Model

```typescript
type PromptEntry = {
  id: string;
  rawInput: string;
  analysis: PromptAnalysis;
  simpleOutput: string;
  standardOutput: string;
  professionalOutput: string;
  researchOutput: string;
  improvements: string[];
  model: string;
  inputTokens: number;
  outputTokens: number;
  isFavorite: boolean;
  createdAt: Date;
};
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/builder/analyze` | POST | Phase 1: analyze raw prompt |
| `/api/builder/generate` | POST | Phase 2: generate 4 levels |

## UI Components

| Component | Responsibility |
|-----------|---------------|
| `BuilderPanel` | Root: phase state machine, layout |
| `InputSection` | Textarea for raw prompt input |
| `AnalysisSection` | Display PromptAnalysis results |
| `OutputSection` | 4-tab interface (Simple/Standard/Professional/Research) |
| `LevelCard` | Single output with copy button + char count |
| `ImprovementPanel` | Collapsible: shows reasoning + suggestions |

## Key Design Decisions

- **Two separate API calls** — analysis and generation are separate so the user sees analysis results immediately (~2s) without waiting for generation (~10s). Progress feels faster.
- **Sonnet for analysis, Opus for generation** — analysis is structured extraction (Sonnet is sufficient and cheaper). Generation requires nuanced writing (Opus justifies cost).
- **History saved to D1** — all generated prompts are saved so users can revisit past generations without re-running the expensive Opus call.
- **No streaming** — both phases return complete JSON objects. Streaming structured JSON mid-generation is unreliable. Latency is acceptable for this use case.
- **Copy to Chat** — OutputSection includes a "Use in Chat" button that pre-fills the Chat input with the selected level.
