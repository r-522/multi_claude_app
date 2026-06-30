# Skill: prompt-engineering

## Description
Design, optimize, and debug prompts for Claude across all three features.

## When to Use
- Writing the Prompt Builder's analysis and 4-level generation prompts
- Designing the task decomposition and Plan/Execute/Review/Improve prompts
- Optimizing prompts for a specific model + effort level combination
- Debugging unexpected Claude behavior (refusals, poor output quality, hallucinations)

## Model Selection Guide

| Task | Model | Effort | Why |
|------|-------|--------|-----|
| Chat (default) | claude-sonnet-4-6 | high | Best quality/cost for interactive use |
| Prompt analysis | claude-sonnet-4-6 | medium | Fast, structured output |
| Prompt generation | claude-opus-4-8 | high | Highest quality for nuanced writing |
| Task decomposition | claude-sonnet-4-6 | medium | Structured JSON, fast |
| Task execution (each phase) | claude-opus-4-8 | xhigh | Best reasoning for complex tasks |
| Task review | claude-sonnet-4-6 | high | Clear verdict needed, cost-efficient |
| Quick tasks | claude-haiku-4-5 | N/A | Cheapest, no effort param |

## Best Practices
- System prompt = stable context (persona, format rules, constraints) — never dynamic content
- User turn = dynamic content (input, history, current task) — never stable context
- Use `output_config.format` for structured JSON output (not prefill tricks)
- Never use `budget_tokens` — use `effort` parameter instead
- For structured output: provide JSON schema example in the prompt, not just description
- Test prompts with both Sonnet and Opus — cheaper Sonnet may be sufficient
- Chain-of-thought: let Claude reason before outputting structured answer ("think step by step, then provide JSON")

## Prompt Builder Prompts
```
Analysis system: "You analyze prompts. For the user's raw prompt, identify:
  purpose, constraints[], expectedOutput, missingInfo[], improvements[].
  Respond with JSON matching the PromptAnalysis schema."

Generation system: "Given a prompt and its analysis, generate 4 refined versions:
  simple (direct, no fluff), standard (clear structure), professional (formal, complete),
  research (academic rigor, cited). Also explain key improvement decisions.
  Respond with JSON matching the BuiltPrompt schema."
```

## Task Loop Prompts
```
Decompose: "Break this goal into 3–8 ordered, concrete sub-tasks. Each has a title
  and description. Return JSON array of { title, description }."

Plan: "For this sub-task: [description]. Think through the approach step-by-step.
  What is the plan? Consider edge cases and dependencies."

Execute: "Execute this sub-task following the plan: [plan]. Produce the actual output."

Review: "Review the execution output against the sub-task goal.
  Return JSON: { verdict: 'pass' | 'fail', reason: string }"

Improve: "The review found this issue: [reason]. Improve the execution output."
```

## Failure Handling
- Refusal (`stop_reason: "refusal"`): check if prompt contains sensitive patterns; rephrase neutrally
- Malformed JSON output: add `"Your entire response must be valid JSON."` to system prompt
- Output too short: raise effort level or add explicit length guidance
- Repetitive output: lower temperature (for Sonnet/Haiku) or reduce effort (for Opus/Fable)
