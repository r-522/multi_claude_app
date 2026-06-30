import { useEffect, useRef } from "react";
import { useNavigate } from "@remix-run/react";
import { MessageItem } from "./MessageItem";
import { ChatInput } from "./ChatInput";
import { ModelSelector } from "./ModelSelector";
import { ScrollArea } from "~/shared/components/ui/ScrollArea";
import { useChat } from "~/features/chat/hooks/useChat";
import type { Conversation, Message } from "~/shared/lib/db/schema";
import type { ModelId, EffortLevel } from "~/shared/types/claude";
import { useState } from "react";
import type { ChatMessage } from "~/features/chat/hooks/useChat";

interface ChatPanelProps {
  conversation: Conversation;
  initialMessages: Message[];
}

export function ChatPanel({ conversation, initialMessages }: ChatPanelProps) {
  const navigate = useNavigate();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [model, setModel] = useState<ModelId>(conversation.model as ModelId);
  const [effort, setEffort] = useState<EffortLevel>("high");
  const [temperature, setTemperature] = useState<number>(conversation.temperature ?? 0.7);

  const { messages, send, stop, setInitialMessages, isStreaming } = useChat({
    conversationId: conversation.id,
    model,
    systemPrompt: conversation.systemPrompt,
    temperature,
    maxTokens: conversation.maxTokens,
  });

  useEffect(() => {
    const mapped: ChatMessage[] = initialMessages.map((m) => ({
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
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <ModelSelector
        model={model}
        effort={effort}
        temperature={temperature}
        onModelChange={setModel}
        onEffortChange={setEffort}
        onTemperatureChange={setTemperature}
      />

      <ScrollArea className="flex-1" viewportRef={viewportRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-2">
            <p className="text-sm text-zinc-400 dark:text-zinc-600">Start a conversation</p>
          </div>
        ) : (
          <div className="py-4">
            {messages.map((msg) => (
              <MessageItem key={msg.id} message={msg} />
            ))}
          </div>
        )}
      </ScrollArea>

      <ChatInput
        onSend={send}
        onStop={stop}
        isStreaming={isStreaming}
      />
    </div>
  );
}
