export const MODEL_REGISTRY = {
    "claude-fable-5": {
        id: "claude-fable-5",
        displayName: "Fable 5",
        supportsTemperature: false,
        supportsEffort: true,
        supportsXHighEffort: true,
        supportsThinking: false,
        contextWindow: 1_000_000,
        maxOutputTokens: 131_072,
    },
    "claude-opus-4-8": {
        id: "claude-opus-4-8",
        displayName: "Opus 4.8",
        supportsTemperature: false,
        supportsEffort: true,
        supportsXHighEffort: true,
        supportsThinking: true,
        contextWindow: 1_000_000,
        maxOutputTokens: 131_072,
    },
    "claude-sonnet-4-6": {
        id: "claude-sonnet-4-6",
        displayName: "Sonnet 4.6",
        supportsTemperature: true,
        supportsEffort: true,
        supportsXHighEffort: false,
        supportsThinking: true,
        contextWindow: 1_000_000,
        maxOutputTokens: 65_536,
    },
    "claude-haiku-4-5-20251001": {
        id: "claude-haiku-4-5-20251001",
        displayName: "Haiku 4.5",
        supportsTemperature: true,
        supportsEffort: false,
        supportsXHighEffort: false,
        supportsThinking: false,
        contextWindow: 200_000,
        maxOutputTokens: 65_536,
    },
};
export const DEFAULT_MODEL = "claude-sonnet-4-6";
export const DEFAULT_MAX_TOKENS = 8192;
export function buildMessageParams(model, opts) {
    const params = {
        model: model.id,
        max_tokens: opts.maxTokens ?? Math.min(DEFAULT_MAX_TOKENS, model.maxOutputTokens),
        messages: opts.messages,
    };
    if (opts.systemPrompt) {
        params.system = opts.systemPrompt;
    }
    if (model.supportsTemperature && opts.temperature !== undefined) {
        params.temperature = opts.temperature;
    }
    if (model.supportsEffort && opts.effort) {
        const effort = opts.effort === "xhigh" && !model.supportsXHighEffort ? "high" : opts.effort;
        params.output_config = { effort };
    }
    // Never send thinking param to Fable 5 — always-on adaptive, sending it = 400
    if (model.supportsThinking && opts.thinking) {
        params.thinking = { type: "enabled", budget_tokens: 10000 };
    }
    return params;
}
export function getModel(id) {
    const model = MODEL_REGISTRY[id];
    if (!model)
        throw new Error(`Unknown model: ${id}`);
    return model;
}
