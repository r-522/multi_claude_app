import { z } from "zod";
import { MODEL_IDS } from "~/shared/types/claude";

export const DecomposeRequestSchema = z.object({
  goal: z.string().min(1).max(10_000),
  model: z.enum(MODEL_IDS).optional().default("claude-sonnet-4-6"),
});

export const ExecutePhaseRequestSchema = z.object({
  subTaskId: z.string(),
  phase: z.enum(["plan", "execute", "review", "improve"]),
  context: z.record(z.string()).optional(),
});

export const SubTaskItemSchema = z.object({
  title: z.string(),
  description: z.string(),
});

export const DecomposeResponseSchema = z.object({
  taskId: z.string(),
  subTasks: z.array(SubTaskItemSchema),
});

export const ReviewVerdictSchema = z.object({
  verdict: z.enum(["pass", "fail"]),
  reason: z.string(),
});

export type DecomposeRequest = z.infer<typeof DecomposeRequestSchema>;
export type ExecutePhaseRequest = z.infer<typeof ExecutePhaseRequestSchema>;
export type ReviewVerdict = z.infer<typeof ReviewVerdictSchema>;
