import { RateLimitError } from "~/shared/lib/errors";

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

interface RateLimiterConfig {
  tokensPerMinute: number;
  burst: number;
}

const DEFAULT_CONFIG: RateLimiterConfig = {
  tokensPerMinute: 20,
  burst: 5,
};

export class RateLimiter {
  constructor(
    private readonly kv: KVNamespace,
    private readonly userId: string,
    private readonly config: RateLimiterConfig = DEFAULT_CONFIG,
  ) {}

  async check(): Promise<void> {
    const key = `rate-limit:${this.userId}`;
    const now = Date.now();
    const raw = await this.kv.get(key);

    let bucket: TokenBucket;
    if (!raw) {
      bucket = { tokens: this.config.burst, lastRefill: now };
    } else {
      bucket = JSON.parse(raw) as TokenBucket;
      const elapsedMinutes = (now - bucket.lastRefill) / 60_000;
      const refill = elapsedMinutes * this.config.tokensPerMinute;
      bucket.tokens = Math.min(this.config.burst + this.config.tokensPerMinute, bucket.tokens + refill);
      bucket.lastRefill = now;
    }

    if (bucket.tokens < 1) {
      const retryAfter = Math.ceil((1 - bucket.tokens) / (this.config.tokensPerMinute / 60));
      throw new RateLimitError(retryAfter);
    }

    bucket.tokens -= 1;
    await this.kv.put(key, JSON.stringify(bucket), { expirationTtl: 3600 });
  }
}
