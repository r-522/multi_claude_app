export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  LOGS: R2Bucket;
  ANTHROPIC_API_KEY: string;
  AI_GATEWAY_URL: string;
  AI_GATEWAY_TOKEN: string;
}
