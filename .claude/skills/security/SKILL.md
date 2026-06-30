# Skill: security

## Description
Review and implement security controls for this application.

## When to Use
- Reviewing any route that accepts user input
- Configuring Content Security Policy headers
- Auditing API key handling
- Checking for injection vulnerabilities
- Reviewing error message exposure

## Security Checklist (run on every PR)

- [ ] No secrets in code, comments, or test fixtures
- [ ] All user input validated with Zod before use
- [ ] No raw SQL strings (all DB access via Drizzle)
- [ ] Error responses don't expose stack traces or internal details
- [ ] SSE endpoints validate the request before opening the stream
- [ ] Rate limiting active on all Claude-calling routes
- [ ] R2 logs don't contain full user message content (only metadata + token counts)
- [ ] CSP headers present on all HTML responses

## CSP Configuration (`public/_headers`)
```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://gateway.ai.cloudflare.com; font-src 'self';
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Best Practices
- API key: only in `wrangler secret put` or Cloudflare dashboard → accessible via `env.ANTHROPIC_API_KEY`
- Never log full request/response bodies — log requestId, model, token counts only
- Zod `.parse()` at route entry — no manual type casting of request body
- Sensitive data in KV: encrypt with Web Crypto API if it's user credentials
- Rate limit: token bucket in KV, check before every Claude call
- CORS: not needed for same-origin Remix app; reject cross-origin requests to `/api/*` routes

## Failure Handling
- Secret accidentally committed: rotate the key immediately, remove from git history
- XSS in markdown: react-markdown sanitizes by default; verify `rehype-raw` is NOT used
- SQL injection via Drizzle: parameterized by default — safe; never use `.execute()` with raw strings
- Rate limit bypass: use KV atomic operations for token bucket; add IP-based secondary limit

## Examples
- Validate chat request:
  ```typescript
  const body = ChatStreamSchema.parse(await request.json());
  // If parse throws → ZodError caught by route → returns 400 with field errors
  ```
- Log without PII:
  ```typescript
  logger.info({ requestId, model, inputTokens, durationMs });
  // NOT: logger.info({ userMessage: body.content })
  ```
