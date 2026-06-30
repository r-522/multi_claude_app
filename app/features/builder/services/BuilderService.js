import { createClaudeClient } from "~/shared/lib/claude/client";
import { buildMessageParams, MODEL_REGISTRY } from "~/shared/lib/claude/models";
import { createDb } from "~/shared/lib/db/client";
import { PromptRepository } from "~/features/builder/repositories/PromptRepository";
import { toAppError } from "~/shared/lib/errors";
const ANALYZE_SYSTEM = `You analyze prompts. For the user's raw prompt, identify:
- purpose: what the prompt is trying to accomplish (one sentence)
- constraints: explicit and implicit constraints (array of strings)
- expectedOutput: what a good response would look like (one paragraph)
- missingInfo: information that would improve the prompt (array of strings)
- improvements: specific improvement suggestions (array of strings)

Respond ONLY with valid JSON matching this schema exactly:
{"purpose":"...","constraints":["..."],"expectedOutput":"...","missingInfo":["..."],"improvements":["..."]}`;
const GENERATE_SYSTEM = `Given a prompt and its analysis, generate 4 refined versions:
- simple: direct, minimal, no fluff — one clear sentence or short paragraph
- standard: clear structure, good for common use cases
- professional: formal, complete, production-ready with all context
- research: academic rigor, explicit methodology and scope
Also explain key improvement decisions in "reasoning".

Respond ONLY with valid JSON matching this schema exactly:
{"simple":"...","standard":"...","professional":"...","research":"...","reasoning":"..."}`;
export class BuilderService {
    env;
    repo;
    constructor(env) {
        this.env = env;
        const db = createDb(env.DB);
        this.repo = new PromptRepository(db);
    }
    async analyze(rawInput) {
        const claude = createClaudeClient(this.env);
        const params = buildMessageParams(MODEL_REGISTRY["claude-sonnet-4-6"], {
            messages: [{ role: "user", content: rawInput }],
            systemPrompt: ANALYZE_SYSTEM,
            maxTokens: 2048,
            effort: "medium",
        });
        try {
            const response = await claude.messages.create(params);
            const text = response.content[0].type === "text" ? response.content[0].text : "";
            const analysis = JSON.parse(text);
            return {
                analysis,
                inputTokens: response.usage.input_tokens,
                outputTokens: response.usage.output_tokens,
            };
        }
        catch (err) {
            throw toAppError(err);
        }
    }
    async generate(rawInput, analysis) {
        const claude = createClaudeClient(this.env);
        const userContent = `Raw prompt: ${rawInput}\n\nAnalysis: ${JSON.stringify(analysis, null, 2)}`;
        const params = buildMessageParams(MODEL_REGISTRY["claude-opus-4-8"], {
            messages: [{ role: "user", content: userContent }],
            systemPrompt: GENERATE_SYSTEM,
            maxTokens: 8192,
            effort: "high",
        });
        try {
            const response = await claude.messages.create(params);
            const text = response.content[0].type === "text" ? response.content[0].text : "";
            const builtPrompt = JSON.parse(text);
            await this.repo.create({
                rawInput,
                analysis,
                builtPrompt,
                model: "claude-opus-4-8",
                inputTokens: response.usage.input_tokens,
                outputTokens: response.usage.output_tokens,
            });
            return {
                builtPrompt,
                inputTokens: response.usage.input_tokens,
                outputTokens: response.usage.output_tokens,
            };
        }
        catch (err) {
            throw toAppError(err);
        }
    }
}
