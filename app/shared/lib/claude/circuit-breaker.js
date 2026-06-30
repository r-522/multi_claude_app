import { ClaudeCircuitOpenError } from "~/shared/lib/errors";
const FAILURE_THRESHOLD = 5;
const COOLDOWN_MS = 30_000;
const KV_KEY = "circuit:claude";
export class CircuitBreaker {
    kv;
    constructor(kv) {
        this.kv = kv;
    }
    async execute(fn) {
        const data = await this.getState();
        if (data.state === "open") {
            const elapsed = Date.now() - (data.openedAt ?? 0);
            if (elapsed < COOLDOWN_MS) {
                throw new ClaudeCircuitOpenError();
            }
            await this.transition({ ...data, state: "half-open" });
        }
        try {
            const result = await fn();
            if (data.state === "half-open" || data.failures > 0) {
                await this.transition({ state: "closed", failures: 0, openedAt: null });
            }
            return result;
        }
        catch (err) {
            const failures = data.failures + 1;
            if (failures >= FAILURE_THRESHOLD) {
                await this.transition({ state: "open", failures, openedAt: Date.now() });
            }
            else {
                await this.transition({ ...data, failures });
            }
            throw err;
        }
    }
    async reset() {
        await this.kv.delete(KV_KEY);
    }
    async getState() {
        const raw = await this.kv.get(KV_KEY);
        if (!raw)
            return { state: "closed", failures: 0, openedAt: null };
        return JSON.parse(raw);
    }
    async transition(data) {
        await this.kv.put(KV_KEY, JSON.stringify(data), {
            expirationTtl: 3600,
        });
    }
}
