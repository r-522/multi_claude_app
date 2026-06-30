# Skill: documentation

## Description
Write and maintain the `docs/` directory documentation for this project.

## When to Use
- Documenting a new feature's architecture and data flow
- Writing API integration documentation
- Creating or updating ADRs after architecture decisions
- Writing onboarding guides for new contributors

## Workflow
1. Identify the document type: architecture, feature, API, ADR, or operational guide
2. Use the appropriate template (see below)
3. Include Mermaid diagrams where the concept benefits from visualization
4. Keep docs co-located with code changes: doc PRs ship with feature PRs

## Document Templates

### Feature doc (`docs/features/NAME.md`)
```markdown
# Feature: {Name}

## Overview
One paragraph: what it does and why.

## Data Flow
Mermaid sequence diagram showing request → server → Claude → response.

## Data Model
Key types used (reference schema.md for full table definitions).

## API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|

## UI Components
Key components and their responsibilities.

## Key Design Decisions
Bullet list of non-obvious choices and why.
```

### ADR (`docs/adr/NNN-title.md`)
```markdown
# ADR-NNN: {Title}

## Status
Accepted | Deprecated | Superseded by ADR-NNN

## Context
What problem prompted this decision.

## Decision
What was chosen.

## Consequences
Good: what this enables.
Bad: what this trades off.
```

## Mermaid Diagram Types
- **Sequence**: request/response flows between client, server, Claude
- **ER**: database schema relationships
- **State**: task state machine (Todo→Doing→Done/Failed/Retry)
- **C4**: system-level architecture (Context, Container)
- **Flowchart**: conditional logic in complex services

## Best Practices
- Every new feature gets a doc in `docs/features/`
- ADRs capture context + consequences — not just the choice
- Docs stay accurate: update alongside code in the same PR
- Don't document what the code already clearly expresses
- API docs include actual request/response JSON examples

## Failure Handling
- Doc is too long: split into sub-documents with links between them
- Mermaid won't render: validate at https://mermaid.live before committing
- Docs diverge from code: add a CI check that runs doc links + diagram validity
