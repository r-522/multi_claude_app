import type { LoaderFunctionArgs } from "@remix-run/cloudflare";

export async function loader({ context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env;

  // Lightweight D1 ping
  let dbOk = false;
  try {
    await env.DB.prepare("SELECT 1").first();
    dbOk = true;
  } catch {
    dbOk = false;
  }

  const status = dbOk ? 200 : 503;
  return Response.json({ status: dbOk ? "ok" : "degraded", db: dbOk }, { status });
}
