import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { useNavigate } from "@remix-run/react";
import { MessageItem } from "./MessageItem";
import { ChatInput } from "./ChatInput";
import { ModelSelector } from "./ModelSelector";
import { ScrollArea } from "~/shared/components/ui/ScrollArea";
import { useChat } from "~/features/chat/hooks/useChat";
import { useState } from "react";
export function ChatPanel({ conversation, initialMessages }) {
    const navigate = useNavigate();
    const viewportRef = useRef(null);
    const [model, setModel] = useState(conversation.model);
    const [effort, setEffort] = useState("high");
    const [temperature, setTemperature] = useState(conversation.temperature ?? 0.7);
    const { messages, send, stop, setInitialMessages, isStreaming } = useChat({
        conversationId: conversation.id,
        model,
        systemPrompt: conversation.systemPrompt,
        temperature,
        maxTokens: conversation.maxTokens,
    });
    useEffect(() => {
        const mapped = initialMessages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            thinking: m.thinking ?? undefined,
            inputTokens: m.inputTokens,
            outputTokens: m.outputTokens,
            model: m.model,
            stopReason: m.stopReason,
        }));
        setInitialMessages(mapped);
    }, [initialMessages, setInitialMessages]);
    // Auto-scroll on new messages
    useEffect(() => {
        const el = viewportRef.current;
        if (el)
            el.scrollTop = el.scrollHeight;
    }, [messages]);
    return (_jsxs("div", { className: "flex flex-col h-full", children: [_jsx(ModelSelector, { model: model, effort: effort, temperature: temperature, onModelChange: setModel, onEffortChange: setEffort, onTemperatureChange: setTemperature }), _jsx(ScrollArea, { className: "flex-1", viewportRef: viewportRef, children: messages.length === 0 ? (_jsx("div", { className: "flex flex-col items-center justify-center h-full min-h-[60vh] gap-2", children: _jsx("p", { className: "text-sm text-zinc-400 dark:text-zinc-600", children: "Start a conversation" }) })) : (_jsx("div", { className: "py-4", children: messages.map((msg) => (_jsx(MessageItem, { message: msg }, msg.id))) })) }), _jsx(ChatInput, { onSend: send, onStop: stop, isStreaming: isStreaming })] }));
}
