# Getting Started

## Prerequisites

- Node.js 20+
- npm 10+
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account (free tier works for development)

## Initial Setup

### 1. Clone and install
```sh
git clone <repo-url> claude-chat
cd claude-chat
npm install
```

### 2. Authenticate with Cloudflare
```sh
wrangler login
```

### 3. Create Cloudflare resources
Follow `docs/deployment/cloudflare-setup.md` to create D1, KV, and R2.

After creating resources, update `wrangler.toml` with the correct IDs.

### 4. Set local secrets
```sh
cp .dev.vars.example .dev.vars
# Edit .dev.vars and fill in your values
```

`.dev.vars`:
```
ANTHROPIC_API_KEY=sk-ant-api03-...
AI_GATEWAY_URL=https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT/claude-chat/anthropic
AI_GATEWAY_TOKEN=your-token-here
```

### 5. Apply database migrations
```sh
npx drizzle-kit generate  # Only if schema.ts was changed
wrangler d1 execute DB --local --file db/migrations/0000_initial.sql
```

### 6. Start development server
```sh
npm run dev
# → http://localhost:8788
```

## Development Workflow

```sh
# Run all checks
npm run typecheck && npm run lint && npm run test

# Watch mode for tests
npm run test -- --watch

# Run specific test file
npm run test -- app/features/chat/services/ChatService.test.ts
```

## IDE Setup

### VS Code (Recommended)
Install extensions:
- `dbaeumer.vscode-eslint` — ESLint
- `esbenp.prettier-vscode` — Prettier
- `bradlc.vscode-tailwindcss` — Tailwind CSS IntelliSense

`.vscode/settings.json` (already in repo):
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" }
}
```

## Common Issues

**`wrangler dev` fails with D1 error:**
→ Run `wrangler d1 execute DB --local --file db/migrations/0000_initial.sql`

**TypeScript errors on `env.DB`:**
→ Ensure `@cloudflare/workers-types` is in devDependencies and `types: ["@cloudflare/workers-types"]` is in `tsconfig.json`

**Tailwind classes not applying:**
→ Ensure `@import "tailwindcss"` is at the top of `app/styles/globals.css`; Tailwind v4 uses CSS-first config

**Shiki highlighting not working:**
→ Shiki loads languages lazily; ensure `createHighlighter()` is called with the required language list
