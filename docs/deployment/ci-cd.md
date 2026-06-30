# CI/CD Pipeline

## GitHub Actions Workflow

File: `.github/workflows/deploy.yml`

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci

      - name: Typecheck
        run: npm run typecheck

      - name: Lint
        run: npm run lint

      - name: Unit + Integration Tests
        run: npm run test

      - name: Build
        run: npm run build

      - name: E2E Tests (main only)
        if: github.ref == 'refs/heads/main'
        run: npx playwright test
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          # E2E tests run against a local wrangler dev instance

      - name: Deploy to Cloudflare Pages
        if: github.ref == 'refs/heads/main'
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: claude-chat
          directory: build/client
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

## Pipeline Stages

| Stage | Runs On | Blocks Deploy |
|-------|---------|--------------|
| Typecheck (`tsc --noEmit`) | All PRs | Yes |
| Lint (ESLint) | All PRs | Yes |
| Unit + Integration tests | All PRs | Yes |
| Build | All PRs | Yes |
| E2E tests (Playwright) | main only | Yes |
| Deploy | main only | N/A |

## D1 Migrations in CI

Integration tests use Miniflare's in-memory D1 (no migration step needed). The production D1 migration runs as a separate manual step before deploying schema-breaking changes:

```sh
wrangler d1 execute DB --file db/migrations/NNNN_*.sql
```

For automated migration in CI, add before the deploy step:
```yaml
- name: Apply D1 migrations
  run: wrangler d1 execute DB --file db/migrations/$(ls db/migrations | tail -1)
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

## Preview Deployments

Cloudflare Pages automatically creates preview deployments for every PR branch. URL format:
`https://<branch-name>.claude-chat.pages.dev`

Preview deployments share the production D1/KV/R2 bindings by default — set up separate preview bindings in the Cloudflare Pages settings for true isolation.

## Rollback

```sh
# List recent deployments
wrangler pages deployment list --project-name claude-chat

# Rollback to specific deployment
wrangler pages deployment rollback <deployment-id> --project-name claude-chat
```

## npm Scripts

| Script | Command |
|--------|---------|
| `npm run dev` | `wrangler pages dev ./build/client` |
| `npm run build` | `remix vite:build` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | `eslint app/` |
| `npm run test` | `vitest run` |
| `npm run test:e2e` | `playwright test` |
| `npm run deploy` | `npm run build && wrangler pages deploy` |
