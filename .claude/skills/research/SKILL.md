# Skill: research

## Description
Research technical decisions using web search, documentation, and code reading.

## When to Use
- Evaluating new Cloudflare features for potential use
- Researching new Claude API capabilities or model changes
- Comparing library options before adding a dependency
- Investigating reported bugs in upstream libraries
- Understanding an unfamiliar pattern or API

## Workflow
1. Check official docs first: Cloudflare docs, Anthropic docs, npm/GitHub README
2. Search for real-world examples or known issues
3. Verify claims with a minimal reproduction if behavioral
4. Summarize findings with citations before implementing
5. If decision has architectural impact → write an ADR in `docs/adr/`

## Key Reference URLs
- Cloudflare Workers docs: https://developers.cloudflare.com/workers/
- Cloudflare D1 docs: https://developers.cloudflare.com/d1/
- Cloudflare KV docs: https://developers.cloudflare.com/kv/
- Cloudflare AI Gateway: https://developers.cloudflare.com/ai-gateway/
- Anthropic docs: https://docs.anthropic.com/
- Remix docs: https://remix.run/docs
- Drizzle ORM docs: https://orm.drizzle.team/
- Tailwind v4 docs: https://tailwindcss.com/docs

## Best Practices
- Always check the official docs before Stack Overflow or AI-generated answers
- Cite sources in ADRs and PR descriptions — not just conclusions
- Verify API behavior with a minimal reproduction before full implementation
- Flag when research findings contradict existing architecture decisions (may need ADR update)
- For model capability questions: read `docs/api/model-capabilities.md` first

## Failure Handling
- Contradictory sources: trust official docs > GitHub issues > blog posts
- Outdated information: check publish dates; Cloudflare and Anthropic APIs change fast
- Can't find answer: write a minimal Worker test script with `wrangler dev`

## Examples
- "Does D1 support full-text search?" → Check D1 docs, test with `LIKE` vs. FTS5 extension
- "What's the Fable 5 context window?" → `docs/api/model-capabilities.md` → cross-check Anthropic docs
- "Can Hono middleware work with Remix?" → Research, test → if yes, write ADR for adoption
