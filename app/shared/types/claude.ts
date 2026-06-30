export const MODEL_IDS = [
  "claude-fable-5",
  "claude-opus-4-8",
  "claude-sonnet-4-6",
  "claude-haiku-4-5-20251001",
] as const;

export type ModelId = (typeof MODEL_IDS)[number];

export type EffortLevel = "low" | "medium" | "high" | "xhigh" | "max";

export interface ModelConfig {
  id: ModelId;
  displayName: string;
  supportsTemperature: boolean;
  supportsEffort: boolean;
  supportsXHighEffort: boolean;
  supportsThinking: boolean;
  contextWindow: number;
  maxOutputTokens: number;
}

export type StreamChunk =
  | { type: "delta"; content: string }
  | { type: "thinking"; thinking: string }
  | { type: "done"; inputTokens: number; outputTokens: number; stopReason: string }
  | { type: "error"; code: string; message: string; retryable: boolean };

export interface CoreMessage {
  role: "user" | "assistant";
  content: string;
}

export interface BuildMessageParamsOptions {
  messages: CoreMessage[];
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  effort?: EffortLevel;
  thinking?: boolean;
}
