// Typed KV wrapper with namespaced key helpers

export interface AbortFlagOpts {
  ttlSeconds?: number;
}

export class KVClient {
  constructor(private readonly kv: KVNamespace) {}

  // Abort flags
  async setAbortFlag(conversationId: string, opts: AbortFlagOpts = {}): Promise<void> {
    await this.kv.put(`abort:${conversationId}`, "1", {
      expirationTtl: opts.ttlSeconds ?? 60,
    });
  }

  async checkAndClearAbortFlag(conversationId: string): Promise<boolean> {
    const flag = await this.kv.get(`abort:${conversationId}`);
    if (flag) {
      await this.kv.delete(`abort:${conversationId}`);
      return true;
    }
    return false;
  }

  // Pause flags
  async setPauseFlag(taskId: string): Promise<void> {
    await this.kv.put(`task-paused:${taskId}`, "1", { expirationTtl: 3600 });
  }

  async clearPauseFlag(taskId: string): Promise<void> {
    await this.kv.delete(`task-paused:${taskId}`);
  }

  async isPaused(taskId: string): Promise<boolean> {
    return (await this.kv.get(`task-paused:${taskId}`)) !== null;
  }

  // Generic
  async get(key: string): Promise<string | null> {
    return this.kv.get(key);
  }

  async put(key: string, value: string, opts?: KVNamespacePutOptions): Promise<void> {
    await this.kv.put(key, value, opts);
  }

  async delete(key: string): Promise<void> {
    await this.kv.delete(key);
  }
}
