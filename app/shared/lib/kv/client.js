// Typed KV wrapper with namespaced key helpers
export class KVClient {
    kv;
    constructor(kv) {
        this.kv = kv;
    }
    // Abort flags
    async setAbortFlag(conversationId, opts = {}) {
        await this.kv.put(`abort:${conversationId}`, "1", {
            expirationTtl: opts.ttlSeconds ?? 60,
        });
    }
    async checkAndClearAbortFlag(conversationId) {
        const flag = await this.kv.get(`abort:${conversationId}`);
        if (flag) {
            await this.kv.delete(`abort:${conversationId}`);
            return true;
        }
        return false;
    }
    // Pause flags
    async setPauseFlag(taskId) {
        await this.kv.put(`task-paused:${taskId}`, "1", { expirationTtl: 3600 });
    }
    async clearPauseFlag(taskId) {
        await this.kv.delete(`task-paused:${taskId}`);
    }
    async isPaused(taskId) {
        return (await this.kv.get(`task-paused:${taskId}`)) !== null;
    }
    // Generic
    async get(key) {
        return this.kv.get(key);
    }
    async put(key, value, opts) {
        await this.kv.put(key, value, opts);
    }
    async delete(key) {
        await this.kv.delete(key);
    }
}
