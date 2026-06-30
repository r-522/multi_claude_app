import { RateLimitError } from "~/shared/lib/errors";
const DEFAULT_CONFIG = {
    tokensPerMinute: 20,
    burst: 5,
};
export class RateLimiter {
    kv;
    userId;
    config;
    constructor(kv, userId, config = DEFAULT_CONFIG) {
        this.kv = kv;
        this.userId = userId;
        this.config = config;
    }
    async check() {
        const key = `rate-limit:${this.userId}`;
        const now = Date.now();
        const raw = await this.kv.get(key);
        let bucket;
        if (!raw) {
            bucket = { tokens: this.config.burst, lastRefill: now };
        }
        else {
            bucket = JSON.parse(raw);
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
