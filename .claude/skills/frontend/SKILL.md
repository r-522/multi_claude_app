# Skill: frontend

## Description
Build and review React components, hooks, and UI patterns for this Remix app.

## When to Use
- Creating or modifying components in `app/features/*/components/` or `app/shared/components/ui/`
- Writing custom hooks in `app/features/*/hooks/`
- Implementing keyboard navigation, ARIA attributes, or focus management
- Working with the design system (Radix UI primitives + Tailwind v4)
- Debugging React hydration errors or streaming issues

## Workflow
1. Check if a shared UI component exists in `app/shared/components/ui/` before creating
2. Use Radix UI primitives as the base for all interactive components
3. Apply Tailwind utilities directly in JSX — no inline styles
4. Add `aria-*` attributes from the start (not as an afterthought)
5. Test keyboard navigation (Tab, Enter, Escape, Arrow keys)

## Best Practices
- Tailwind v4: use `dark:` variant classes for dark mode, toggle `.dark` class on `<html>`
- Dark/light palette: `bg-zinc-950 dark:bg-white` (etc.) — use zinc/indigo/green/amber/red scale
- Radix primitives handle accessibility; never rebuild dialogs, tooltips, or selects from scratch
- All interactive elements: focusable, has visible focus ring (`focus-visible:ring-2`)
- Loading state required for every async operation; error state required for every failure
- Components ≤ 150 lines. Extract to sub-components when larger.
- Streaming messages: update incrementally via state, not DOM manipulation

## Dark Mode Color Reference
```
Background:  bg-white dark:bg-zinc-950
Surface:     bg-zinc-100 dark:bg-zinc-900
Border:      border-zinc-200 dark:border-zinc-800
Text:        text-zinc-900 dark:text-zinc-50
Muted text:  text-zinc-500
Accent:      text-indigo-500 dark:text-indigo-400
```

## Failure Handling
- Hydration mismatch: check that SSR and client render the same initial state
- Streaming text flicker: use `useRef` to accumulate without causing re-renders
- Component too large: identify the largest sub-concern and extract it first

## Examples
- Token counter: local state updated by `useStream` hook, no server round-trip needed
- ModelSelector: reads `MODEL_REGISTRY` for capability flags; hides Temperature for Opus 4.8+
- MessageContent: uses react-markdown with custom renderers for code blocks (Shiki highlighting)
