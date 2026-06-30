# Cloudflare Setup

## One-Time Setup

### 1. Create D1 Database
```sh
wrangler d1 create claude-chat-db
# → Copy the database_id to wrangler.toml
```

### 2. Create KV Namespace
```sh
wrangler kv:namespace create claude-chat
# → Copy the id to wrangler.toml [[kv_namespaces]]
```

### 3. Create R2 Bucket
```sh
wrangler r2 bucket create claude-chat-logs
# No ID needed — bucket_name is sufficient
```

### 4. Create AI Gateway
```
Cloudflare Dashboard → AI Gateway → Create Gateway
Name: claude-chat
→ Copy the Gateway URL (format: https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_name}/anthropic)
```

### 5. Set Secrets
```sh
wrangler secret put ANTHROPIC_API_KEY
# paste: sk-ant-api03-...

wrangler secret put AI_GATEWAY_URL
# paste: https://gateway.ai.cloudflare.com/v1/{account_id}/claude-chat/anthropic

wrangler secret put AI_GATEWAY_TOKEN
# paste: (from Cloudflare dashboard → AI Gateway → Auth)
```

### 6. Apply Initial Migrations
```sh
# Generate (if not already done)
npx drizzle-kit generate

# Apply to production D1
wrangler d1 execute DB --file db/migrations/0000_initial.sql
```

### 7. Deploy
```sh
npm run build
wrangler pages deploy ./build/client --project-name claude-chat
```

## Pages Project Setup

```sh
# Create Pages project (first deploy)
wrangler pages project create claude-chat

# Set production branch
# → Dashboard → Pages → claude-chat → Settings → Git Integration → main
```

## Custom Domain (Optional)

```
Dashboard → Pages → claude-chat → Custom Domains → Set up a custom domain
Enter: chat.yourdomain.com
→ Add the CNAME record to your DNS
```

## Verify Setup

After deployment, check:
- `https://chat.yourdomain.com/api/health` returns `200 {"status":"ok"}`
- Dashboard → D1 → claude-chat-db → Tables shows all 6 tables
- Dashboard → AI Gateway → claude-chat → Logs shows requests when you use Chat

## Updating Bindings

When adding new Cloudflare bindings:
1. Add to `wrangler.toml`
2. Add to `app/shared/types/env.ts` Env interface
3. Redeploy: `npm run deploy`

Note: Bindings in `wrangler.toml` affect local dev (`wrangler dev`). Production bindings are set in the dashboard automatically via `wrangler.toml`.
