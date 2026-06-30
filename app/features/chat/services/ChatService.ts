import type { Env } from "~/shared/types/env";
import { createClaudeClient } from "~/shared/lib/claude/client";
import { buildMessageParams, MODEL_REGISTRY, DEFAULT_MAX_TOKENS } from "~/shared/lib/claude/models";
import { CircuitBreaker } from "~/shared/lib/claude/circuit-breaker";
import { RateLimiter } from "~/shared/lib/claude/rate-limiter";
import { encodeChunk, sseHeaders, buildErrorChunk } from "~/shared/lib/claude/streaming";
import { createDb } from "~/shared/lib/db/client";
import { ConversationRepository } from "~/features/chat/repositories/ConversationRepository";
import { MessageRepository } from "~/features/chat/repositories/MessageRepository";
import { generateTitle } from "~/shared/lib/utils";
import type { ChatStreamRequest } from "~/features/chat/schemas/chat.schema";
import type { StreamChunk } from "~/shared/types/claude";

const USER_ID = "default";

export class ChatService {
  private readonly conversationRepo: ConversationRepository;
  private readonly messageRepo: MessageRepository;
  private readonly circuitBreaker: CircuitBreaker;
  private readonly rateLimiter: RateLimiter;

  constructor(private readonly env: Env) {
    const db = createDb(env.DB);
    this.conversationRepo = new ConversationRepository(db);
    this.messageRepo = new MessageRepository(db);
    this.circuitBreaker = new CircuitBreaker(env.KV);
    this.rateLimiter = new RateLimiter(env.KV, USER_ID);
  }

  async stream(req: ChatStreamRequest): Promise<Response> {
    await this.rateLimiter.check();

    const coreMessages = await this.messageRepo.toCoreMessages(req.conversationId);

    await this.messageRepo.create({
      conversationId: req.conversationId,
      role: "user",
      content: req.content,
    });

    coreMessages.push({ role: "user", content: req.content });

    const model = MODEL_REGISTRY[req.model];
    const params = buildMessageParams(model, {
      messages: coreMessages,
      systemPrompt: req.systemPrompt,
      temperature: req.temperature,
      maxTokens: req.maxTokens ?? DEFAULT_MAX_TOKENS,
      effort: req.effort,
    });

    const claudeClient = createClaudeClient(this.env);
    const conv = await this.conversationRepo.findById(req.conversationId);

    let fullContent = "";
    let fullThinking = "";

    const readable = new ReadableStream({
      start: async (controller) => {
        const send = (chunk: StreamChunk) =>
          controller.enqueue(encodeChunk(chunk));

        try {
          await this.circuitBreaker.execute(async () => {
            const stream = claudeClient.messages.stream(params);
            let chunkCount = 0;

            for await (const event of stream) {
              // Check abort flag every 5 chunks
              if (++chunkCount % 5 === 0) {
                const aborted = await this.env.KV.get(`abort:${req.conversationId}`);
                if (aborted) {
                  await this.env.KV.delete(`abort:${req.conversationId}`);
                  break;
                }
              }

              if (event.type === "content_block_delta") {
                if (event.delta.type === "text_delta") {
                  fullContent += event.delta.text;
                  send({ type: "delta", content: event.delta.text });
                } else if ((event.delta as { type: string }).type === "thinking_delta") {
                  const td = event.delta as unknown as { thinking: string };
                  fullThinking += td.thinking;
                  send({ type: "thinking", thinking: td.thinking });
                }
              }
            }

            const finalMsg = await stream.finalMessage();
            const { input_tokens: inputTokens, output_tokens: outputTokens } = finalMsg.usage;
            const stopReason = finalMsg.stop_reason ?? "end_turn";

            if ((stopReason as string) === "refusal") {
              fullContent = "I can't help with that request.";
            }

            await this.messageRepo.create({
              conversationId: req.conversationId,
              role: "assistant",
              content: fullContent,
              thinking: fullThinking || undefined,
              inputTokens,
              outputTokens,
              model: req.model,
              stopReason,
            });

            await this.conversationRepo.incrementTokens(req.conversationId, inputTokens, outputTokens);

            if (!conv?.title) {
              const title = generateTitle(req.content);
              await this.conversationRepo.updateTitle(req.conversationId, title);
            }

            send({ type: "done", inputTokens, outputTokens, stopReason });
          });
        } catch (err) {
          send(buildErrorChunk(err));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, { headers: sseHeaders() });
  }
}
