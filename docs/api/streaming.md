# SSE Streaming Protocol

## Overview

Chat uses Server-Sent Events (SSE) for real-time Claude streaming. The server transforms Claude SDK events into a simple wire format the browser can consume.

## Wire Format

Each event is a line in the SSE stream:

```
data: {"type":"delta","content":"Hello"}\n\n
data: {"type":"thinking","thinking":"Let me consider..."}\n\n
data: {"type":"done","inputTokens":150,"outputTokens":42,"stopReason":"end_turn"}\n\n
data: {"type":"error","code":"RATE_LIMIT","message":"Rate limited","retryable":true}\n\n
```

### StreamChunk Type

```typescript
export type StreamChunk =
  | { type: "delta"; content: string }
  | { type: "thinking"; thinking: string }
  | { type: "done"; inputTokens: number; outputTokens: number; stopReason: string }
  | { type: "error"; code: string; message: string; retryable: boolean };
```

## Required Response Headers

```typescript
return new Response(stream, {
  headers: {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "X-Accel-Buffering": "no",  // REQUIRED: disables Cloudflare response buffering
  },
});
```

Missing `X-Accel-Buffering: no` causes Cloudflare to buffer the entire response before sending — the user sees nothing until the full response is ready.

## Server Implementation Pattern

```typescript
// app/routes/api.chat.stream.ts
export async function action({ request, context }: ActionFunctionArgs) {
  const env = context.cloudflare.env;
  const body = ChatStreamRequestSchema.parse(await request.json());

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (chunk: StreamChunk) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
      };

      try {
        const claude = createClaudeClient(env);
        const params = buildMessageParams(MODEL_REGISTRY[body.model], {
          messages: await conversationRepo.getHistory(body.conversationId),
          systemPrompt: body.systemPrompt,
          maxTokens: body.maxTokens,
          effort: body.effort,
          temperature: body.temperature,
        });

        let chunkCount = 0;
        const stream = claude.messages.stream(params);

        for await (const event of stream) {
          // Check abort flag every 5 chunks
          if (++chunkCount % 5 === 0) {
            const aborted = await env.KV.get(`abort:${body.conversationId}`);
            if (aborted) {
              await env.KV.delete(`abort:${body.conversationId}`);
              break;
            }
          }

          if (event.type === "content_block_delta") {
            if (event.delta.type === "text_delta") {
              send({ type: "delta", content: event.delta.text });
            } else if (event.delta.type === "thinking_delta") {
              send({ type: "thinking", thinking: event.delta.thinking });
            }
          }
        }

        const msg = await stream.finalMessage();
        send({
          type: "done",
          inputTokens: msg.usage.input_tokens,
          outputTokens: msg.usage.output_tokens,
          stopReason: msg.stop_reason ?? "end_turn",
        });
      } catch (err) {
        const appErr = toAppError(err);
        send({ type: "error", code: appErr.code, message: appErr.message, retryable: appErr.retryable });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
```

## Client Implementation Pattern

```typescript
// app/features/chat/hooks/useStream.ts
export function useStream() {
  const abortRef = useRef<AbortController | null>(null);

  const startStream = useCallback((url: string, body: object, handlers: StreamHandlers) => {
    abortRef.current = new AbortController();

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: abortRef.current.signal,
    }).then(async (response) => {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const chunk: StreamChunk = JSON.parse(line.slice(6));

          if (chunk.type === "delta") handlers.onDelta(chunk.content);
          else if (chunk.type === "thinking") handlers.onThinking(chunk.thinking);
          else if (chunk.type === "done") handlers.onDone(chunk);
          else if (chunk.type === "error") handlers.onError(chunk);
        }
      }
    });
  }, []);

  const stopStream = useCallback(() => abortRef.current?.abort(), []);

  return { startStream, stopStream };
}
```

## Abort Protocol

1. User clicks stop button → calls `POST /api/chat/stop { conversationId }`
2. Server writes `KV.put("abort:{conversationId}", "1", { expirationTtl: 60 })`
3. Streaming route checks KV every 5 chunks, reads the flag, closes the stream
4. Stream handler deletes the KV key
5. Client receives `done` chunk with `stopReason: "stop_sequence"`
6. Client saves partial message to D1 with `stopReason: "interrupted"`
