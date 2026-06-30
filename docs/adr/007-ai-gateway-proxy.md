# ADR-007: Route All Claude API Calls Through Cloudflare AI Gateway

## Status
Accepted

## Context

We need to call the Anthropic Claude API from Cloudflare Workers. Options:

- **Direct to Anthropic**: Simple, but no observability, no caching, no rate limiting before Anthropic
- **Cloudflare AI Gateway**: Cloudflare-managed proxy in front of Anthropic, zero latency overhead (same PoP)
- **Custom proxy Worker**: Full control, but significant maintenance burden

AI Gateway provides:
- Request/response logging visible in Cloudflare dashboard
- Semantic prompt caching (same prompt hash → cached response, ~1ms)
- Rate limiting before requests reach Anthropic (cheaper than 429 retries)
- Provider fallback chains (e.g., Opus 4.8 → Sonnet 4.6 if overloaded)
- Cost analytics per endpoint

The only configuration change is setting `baseURL` in the Anthropic SDK client to the AI Gateway URL. No code changes to call logic.

## Decision

**Route all Claude API calls through Cloudflare AI Gateway.**

The implementation is a single change in `createClaudeClient()`:
```typescript
return new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
  baseURL: env.AI_GATEWAY_URL,  // ← AI Gateway URL
  defaultHeaders: {
    "cf-aig-authorization": `Bearer ${env.AI_GATEWAY_TOKEN}`,
  },
});
```

## Consequences

**Good:**
- Observability: every Claude call logged with model, latency, token usage, status
- Semantic caching: identical prompts cached at the edge (significant cost saving for Prompt Builder analysis)
- Rate limiting: AI Gateway rate limits fire before Anthropic, saving API quota
- Zero latency overhead: AI Gateway is in the same Cloudflare PoP as the Worker
- Easy to disable: remove `baseURL` override to bypass Gateway (useful for debugging)

**Bad:**
- AI Gateway requires separate Cloudflare resource setup (one-time, ~5 minutes)
- Adds `AI_GATEWAY_URL` and `AI_GATEWAY_TOKEN` secrets to manage
- Semantic caching may serve stale responses for dynamic prompts (mitigated: cache key includes full prompt hash)
- If Cloudflare AI Gateway has an outage, all Claude calls fail (mitigated: direct Anthropic fallback via env flag)
