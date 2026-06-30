# ADR-006: UI Primitives — Radix UI with Custom Styling (No shadcn defaults)

## Status
Accepted

## Context

We need accessible UI primitives (dialogs, dropdowns, tooltips, scroll areas) with a premium design aesthetic matching Notion/Linear/Stripe — not the typical AI chatbot look.

Options:
- **shadcn/ui**: Pre-styled Radix UI components, widely used in AI tools — results in a recognizable "AI tool" aesthetic
- **Radix UI primitives + custom CSS**: Accessible, unstyled, fully customizable
- **Headless UI (Tailwind)**: Good primitives, but smaller component library than Radix
- **Mantine / Chakra UI**: Comprehensive but opinionated styling that's hard to override
- **Pure HTML + Tailwind**: Most control, but loses accessibility guarantees (focus management, ARIA, keyboard nav)

The primary concern is design differentiation. shadcn/ui's defaults are heavily associated with the "AI demo" aesthetic. Our design tokens (zinc palette, Inter font, minimal color use) must be applied consistently to all primitives.

## Decision

Use **Radix UI primitives** with **completely custom Tailwind styling**. Do not use shadcn/ui's component files.

All Radix primitives are installed as individual packages (`@radix-ui/react-dialog`, etc.). Each component in `app/shared/components/ui/` wraps the Radix primitive with project-specific styling matching the design tokens in `docs/architecture/security-model.md`.

## Consequences

**Good:**
- Full control over appearance — no shadcn defaults to fight
- Accessibility guarantees from Radix (focus trap, ARIA, keyboard navigation) without writing it ourselves
- Design system is consistent with Notion/Linear aesthetic
- No risk of AI-chatbot-look by default

**Bad:**
- More initial setup than copying shadcn component files
- Each UI component must be written (estimated: ~4h for full component library)
- Upgrading Radix primitives requires testing each component (no shadcn maintainer to track breaking changes)
