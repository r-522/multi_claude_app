import { useState } from "react";
import { Copy, Check, ChevronDown } from "lucide-react";
import { MessageContent } from "./MessageContent";
import { Button } from "~/shared/components/ui/Button";
import { Badge } from "~/shared/components/ui/Badge";
import { Tooltip } from "~/shared/components/ui/Tooltip";
import { formatTokens } from "~/shared/lib/utils";
import type { ChatMessage } from "~/features/chat/hooks/useChat";
import { cn } from "~/shared/lib/utils";

interface MessageItemProps {
  message: ChatMessage;
}

export function MessageItem({ message }: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const [thinkingOpen, setThinkingOpen] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "group flex gap-4 px-6 py-4",
        "hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors",
      )}
      data-testid={`message-${message.role}`}
    >
      {/* Avatar */}
      <div
        className={cn(
          "h-6 w-6 rounded-full shrink-0 mt-0.5 flex items-center justify-center text-[10px] font-bold",
          isUser
            ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
            : "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300",
        )}
      >
        {isUser ? "U" : "C"}
      </div>

      <div className="flex-1 min-w-0">
        {/* Thinking panel */}
        {message.thinking && (
          <div className="mb-3 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            <button
              onClick={() => setThinkingOpen((o) => !o)}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <ChevronDown
                className={cn("h-3 w-3 transition-transform", thinkingOpen && "rotate-180")}
              />
              Extended thinking
            </button>
            {thinkingOpen && (
              <div className="px-3 pb-3 text-xs text-zinc-500 dark:text-zinc-400 font-mono whitespace-pre-wrap border-t border-zinc-200 dark:border-zinc-700 pt-2">
                {message.thinking}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        {message.isStreaming && !message.content ? (
          <div className="flex gap-1 py-2" data-testid="streaming-indicator">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
          </div>
        ) : (
          <MessageContent content={message.content} />
        )}

        {/* Footer */}
        {!isUser && !message.isStreaming && (
          <div className="flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {message.inputTokens !== undefined && (
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                ↑ {formatTokens(message.inputTokens)} ↓ {formatTokens(message.outputTokens ?? 0)}
              </span>
            )}
            {message.stopReason === "interrupted" && (
              <Badge variant="warning">interrupted</Badge>
            )}
            <Tooltip content={copied ? "Copied!" : "Copy"}>
              <Button variant="ghost" size="icon" onClick={copy} className="h-6 w-6">
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
}
