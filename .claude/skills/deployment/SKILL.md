# Skill: deployment

## Description
Deploy and operate this application on Cloudflare Pages.

## When to Use
- Setting up Cloudflare resources for the first time
- Running D1 migrations in production
- Debugging deployment failures
- Configuring environment variables and secrets
- Setting up or modifying the GitHub Actions CI pipeline

## Workflow: First Deployment

1. Create Cloudflare resources:
   ```sh
   wrangler d1 create claude-chat-db           # note the database_id
   wrangler kv namespace create KV             # note the id
   wrangler kv namespace create KV --preview   # note the preview_id
   wrangler r2 bucket create claude-chat-logs
   ```
2. Update `wrangler.toml` with the IDs from step 1
3. Add secrets:
   ```sh
   wrangler secret put ANTHROPIC_API_KEY
   wrangler secret put AI_GATEWAY_URL     # optional
   wrangler secret put AI_GATEWAY_TOKEN   # optional
   ```
4. Apply migrations to production D1:
   ```sh
   npm run db:migrate:remote
   ```
5. Build and deploy:
   ```sh
   npm run build && npm run deploy
   ```
6. Set up custom domain in Cloudflare Pages dashboard

## GitHub Actions Secrets Required
- `CLOUDFLARE_API_TOKEN` — Pages deploy token
- `CLOUDFLARE_ACCOUNT_ID` — Account ID
- `ANTHROPIC_API_KEY` — For E2E tests (main branch only)

## Best Practices
- Secrets: only via `wrangler secret put` or Cloudflare dashboard — never in wrangler.toml
- Migrations: always run `--remote` before deploy in CI
- Preview deployments: enabled automatically for every PR branch
- Production deploy: requires CI pass + manual review approval (configured in GitHub)
- Monitor logs: `wrangler tail` streams live production logs

## Failure Handling
- Deploy fails "too many routes": check `functions/[[path]].ts` for syntax errors
- D1 migration fails: check for constraint violations; may need `ALTER TABLE` migration
- Bundle too large: audit Shiki language imports (`createHighlighter` with explicit langs list)
- Workers CPU limit: check for synchronous heavy computation; move to Queue consumer

## Examples
- Add new D1 table: `npm run db:generate` → review generated SQL → `npm run db:migrate` → commit migration file → PR
- Rollback migration: write a new reverse migration (D1 does not support rollback natively)
- Check production D1: `wrangler d1 execute DB --remote --command "SELECT COUNT(*) FROM conversations"`
