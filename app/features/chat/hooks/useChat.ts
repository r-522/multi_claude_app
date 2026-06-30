import { useState, useCallback } from "react";
import { useStream } from "./useStream";
import { nanoid } from "~/shared/lib/utils";
import type { ModelId } from "~/shared/types/claude";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  thinking?: string;
  inputTokens?: number;
  outputTokens?: number;
  model?: string;
  stopReason?: string;
  isStreaming?: boolean;
  error?: string;
}

type ChatState = "idle" | "streaming" | "error";

interface UseChatOptions {
  conversationId: string;
  model: ModelId;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export function useChat(options: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [state, setState] = useState<ChatState>("idle");
  const { start, stop } = useStream();

  const send = useCallback(
    async (content: string) => {
      if (state === "streaming") return;

      const userMsg: ChatMessage = {
        id: nanoid(),
        role: "user",
        content,
      };

      const assistantId = nanoid();
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setState("streaming");

      await start(
        "/api/chat/stream",
        {
          conversationId: options.conversationId,
          content,
          model: options.model,
          systemPrompt: options.systemPrompt ?? "",
          temperature: options.temperature,
          maxTokens: options.maxTokens,
          effort: "high",
        },
        {
          onDelta: (text) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + text } : m,
              ),
            );
          },
          onThinking: (thinking) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, thinking: (m.thinking ?? "") + thinking }
                  : m,
              ),
            );
          },
          onDone: (chunk) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      isStreaming: false,
                      inputTokens: chunk.inputTokens,
                      outputTokens: chunk.outputTokens,
                      stopReason: chunk.stopReason,
                      model: options.model,
                    }
                  : m,
              ),
            );
            setState("idle");
          },
          onError: (err) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, isStreaming: false, error: err.message, content: err.message }
                  : m,
              ),
            );
            setState("error");
          },
        },
      );
    },
    [state, start, options],
  );

  const stopStreaming = useCallback(async () => {
    stop();
    await fetch("/api/chat/stop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: options.conversationId }),
    });
    setMessages((prev) =>
      prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m)),
    );
    setState("idle");
  }, [stop, options.conversationId]);

  const setInitialMessages = useCallback((msgs: ChatMessage[]) => {
    setMessages(msgs);
  }, []);

  return {
    messages,
    state,
    send,
    stop: stopStreaming,
    setInitialMessages,
    isStreaming: state === "streaming",
  };
}
