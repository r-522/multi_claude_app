import { useState, useCallback } from "react";
import { useStream } from "./useStream";
import { nanoid } from "~/shared/lib/utils";
export function useChat(options) {
    const [messages, setMessages] = useState([]);
    const [state, setState] = useState("idle");
    const { start, stop } = useStream();
    const send = useCallback(async (content) => {
        if (state === "streaming")
            return;
        const userMsg = {
            id: nanoid(),
            role: "user",
            content,
        };
        const assistantId = nanoid();
        const assistantMsg = {
            id: assistantId,
            role: "assistant",
            content: "",
            isStreaming: true,
        };
        setMessages((prev) => [...prev, userMsg, assistantMsg]);
        setState("streaming");
        await start("/api/chat/stream", {
            conversationId: options.conversationId,
            content,
            model: options.model,
            systemPrompt: options.systemPrompt ?? "",
            temperature: options.temperature,
            maxTokens: options.maxTokens,
            effort: "high",
        }, {
            onDelta: (text) => {
                setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: m.content + text } : m));
            },
            onThinking: (thinking) => {
                setMessages((prev) => prev.map((m) => m.id === assistantId
                    ? { ...m, thinking: (m.thinking ?? "") + thinking }
                    : m));
            },
            onDone: (chunk) => {
                setMessages((prev) => prev.map((m) => m.id === assistantId
                    ? {
                        ...m,
                        isStreaming: false,
                        inputTokens: chunk.inputTokens,
                        outputTokens: chunk.outputTokens,
                        stopReason: chunk.stopReason,
                        model: options.model,
                    }
                    : m));
                setState("idle");
            },
            onError: (err) => {
                setMessages((prev) => prev.map((m) => m.id === assistantId
                    ? { ...m, isStreaming: false, error: err.message, content: err.message }
                    : m));
                setState("error");
            },
        });
    }, [state, start, options]);
    const stopStreaming = useCallback(async () => {
        stop();
        await fetch("/api/chat/stop", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conversationId: options.conversationId }),
        });
        setMessages((prev) => prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m)));
        setState("idle");
    }, [stop, options.conversationId]);
    const setInitialMessages = useCallback((msgs) => {
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
