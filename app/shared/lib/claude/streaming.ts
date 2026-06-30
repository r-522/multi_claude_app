import type { StreamChunk } from "~/shared/types/claude";
import { toAppError } from "~/shared/lib/errors";

const encoder = new TextEncoder();

export function encodeChunk(chunk: StreamChunk): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`);
}

export function sseHeaders(): HeadersInit {
  return {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "X-Accel-Buffering": "no",
  };
}

export interface StreamHandlers {
  onDelta: (content: string) => void;
  onThinking: (thinking: string) => void;
  onDone: (chunk: Extract<StreamChunk, { type: "done" }>) => void;
  onError: (chunk: Extract<StreamChunk, { type: "error" }>) => void;
}

export async function parseSSEStream(
  response: Response,
  handlers: StreamHandlers,
): Promise<void> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";

      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith("data: ")) continue;
        const chunk = JSON.parse(line.slice(6)) as StreamChunk;

        if (chunk.type === "delta") handlers.onDelta(chunk.content);
        else if (chunk.type === "thinking") handlers.onThinking(chunk.thinking);
        else if (chunk.type === "done") handlers.onDone(chunk);
        else if (chunk.type === "error") handlers.onError(chunk);
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export function buildErrorChunk(err: unknown): Extract<StreamChunk, { type: "error" }> {
  const appErr = toAppError(err);
  return {
    type: "error",
    code: appErr.code,
    message: appErr.message,
    retryable: appErr.retryable,
  };
}
