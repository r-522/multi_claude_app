import type { Env } from "~/shared/types/env";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  timestamp: string;
  requestId: string;
  level: LogLevel;
  feature: string;
  message: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  durationMs?: number;
  stopReason?: string;
  error?: string;
  [key: string]: unknown;
}

export class Logger {
  private readonly requestId: string;

  constructor(
    private readonly env: Env,
    private readonly ctx: ExecutionContext,
    private readonly feature: string,
  ) {
    this.requestId = crypto.randomUUID();
  }

  info(data: Omit<LogEntry, "timestamp" | "requestId" | "level" | "feature">): void {
    this.write("info", data);
  }

  warn(data: Omit<LogEntry, "timestamp" | "requestId" | "level" | "feature">): void {
    this.write("warn", data);
  }

  error(data: Omit<LogEntry, "timestamp" | "requestId" | "level" | "feature">): void {
    this.write("error", data);
  }

  private write(level: LogLevel, data: Record<string, unknown>): void {
    const entry: LogEntry = {
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

  private async persist(entry: LogEntry): Promise<void> {
    try {
      const now = new Date(entry.timestamp);
      const year = now.getUTCFullYear();
      const month = String(now.getUTCMonth() + 1).padStart(2, "0");
      const day = String(now.getUTCDate()).padStart(2, "0");
      const key = `logs/${year}/${month}/${day}/${entry.requestId}.json`;

      await this.env.LOGS.put(key, JSON.stringify(entry), {
        httpMetadata: { contentType: "application/json" },
      });
    } catch {
      // Logging must never throw — swallow silently
    }
  }
}
