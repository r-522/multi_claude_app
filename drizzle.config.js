import { defineConfig } from "drizzle-kit";
export default defineConfig({
    out: "./db/migrations",
    schema: "./app/shared/lib/db/schema.ts",
    dialect: "sqlite",
    // Migrations are applied to Cloudflare D1 via:
    //   wrangler d1 migrations apply DB --local   (local dev)
    //   wrangler d1 migrations apply DB --remote  (production)
});
