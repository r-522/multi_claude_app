import { z } from "zod";
import { MODEL_IDS } from "~/shared/types/claude";

export const ChatStreamRequestSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1).max(100_000),
  model: z.enum(MODEL_IDS),
  systemPrompt: z.string().max(10_000).optional().default(""),
  temperature: z.number().min(0).max(1).optional(),
  maxTokens: z.number().int().min(256).max(131_072).optional(),
  effort: z.enum(["low", "medium", "high", "xhigh", "max"]).optional(),
});

export const ChatStopRequestSchema = z.object({
  conversationId: z.string(),
});

export const CreateConversationSchema = z.object({
  model: z.enum(MODEL_IDS).default("claude-sonnet-4-6"),
  systemPrompt: z.string().max(10_000).optional(),
  temperature: z.number().min(0).max(1).optional(),
  maxTokens: z.number().int().min(256).optional(),
});

export type ChatStreamRequest = z.infer<typeof ChatStreamRequestSchema>;
export type ChatStopRequest = z.infer<typeof ChatStopRequestSchema>;
export type CreateConversationRequest = z.infer<typeof CreateConversationSchema>;
