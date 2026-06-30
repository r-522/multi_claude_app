export class Logger {
    env;
    ctx;
    feature;
    requestId;
    constructor(env, ctx, feature) {
        this.env = env;
        this.ctx = ctx;
        this.feature = feature;
        this.requestId = crypto.randomUUID();
    }
    info(data) {
        this.write("info", data);
    }
    warn(data) {
        this.write("warn", data);
    }
    error(data) {
        this.write("error", data);
    }
    write(level, data) {
        const entry = {
            timestamp: new Date().toISOString(),
            requestId: this.requestId,
            level,
            feature: this.feature,
            ...data,
            message: String(data["message"] ?? ""),
        };
        // Fire-and-forget to R2 via waitUntil (never blocks the response)
        this.ctx.waitUntil(this.persist(entry));
    }
    async persist(entry) {
        try {
            const now = new Date(entry.timestamp);
            const year = now.getUTCFullYear();
            const month = String(now.getUTCMonth() + 1).padStart(2, "0");
            const day = String(now.getUTCDate()).padStart(2, "0");
            const key = `logs/${year}/${month}/${day}/${entry.requestId}.json`;
            await this.env.LOGS.put(key, JSON.stringify(entry), {
                httpMetadata: { contentType: "application/json" },
            });
        }
        catch {
            // Logging must never throw — swallow silently
        }
    }
}
