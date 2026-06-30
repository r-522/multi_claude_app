import Anthropic from "@anthropic-ai/sdk";
export function createClaudeClient(env) {
    return new Anthropic({
        apiKey: env.ANTHROPIC_API_KEY,
        baseURL: env.AI_GATEWAY_URL,
        defaultHeaders: {
            "cf-aig-authorization": `Bearer ${env.AI_GATEWAY_TOKEN}`,
        },
        maxRetries: 0,
    });
}
