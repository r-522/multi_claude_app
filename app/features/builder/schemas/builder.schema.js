import { z } from "zod";
export const AnalyzeRequestSchema = z.object({
    rawInput: z.string().min(1).max(50_000),
});
export const GenerateRequestSchema = z.object({
    rawInput: z.string().min(1).max(50_000),
    analysis: z.object({
        purpose: z.string(),
        constraints: z.array(z.string()),
        expectedOutput: z.string(),
        missingInfo: z.array(z.string()),
        improvements: z.array(z.string()),
    }),
});
export const PromptAnalysisSchema = z.object({
    purpose: z.string(),
    constraints: z.array(z.string()),
    expectedOutput: z.string(),
    missingInfo: z.array(z.string()),
    improvements: z.array(z.string()),
});
export const BuiltPromptSchema = z.object({
    simple: z.string(),
    standard: z.string(),
    professional: z.string(),
    research: z.string(),
    reasoning: z.string(),
});
