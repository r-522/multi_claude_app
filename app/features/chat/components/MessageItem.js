import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Copy, Check, ChevronDown } from "lucide-react";
import { MessageContent } from "./MessageContent";
import { Button } from "~/shared/components/ui/Button";
import { Badge } from "~/shared/components/ui/Badge";
import { Tooltip } from "~/shared/components/ui/Tooltip";
import { formatTokens } from "~/shared/lib/utils";
import { cn } from "~/shared/lib/utils";
export function MessageItem({ message }) {
    const [copied, setCopied] = useState(false);
    const [thinkingOpen, setThinkingOpen] = useState(false);
    const copy = async () => {
        await navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const isUser = message.role === "user";
    return (_jsxs("div", { className: cn("group flex gap-4 px-6 py-4", "hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"), "data-testid": `message-${message.role}`, children: [_jsx("div", { className: cn("h-6 w-6 rounded-full shrink-0 mt-0.5 flex items-center justify-center text-[10px] font-bold", isUser
                    ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                    : "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300"), children: isUser ? "U" : "C" }), _jsxs("div", { className: "flex-1 min-w-0", children: [message.thinking && (_jsxs("div", { className: "mb-3 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden", children: [_jsxs("button", { onClick: () => setThinkingOpen((o) => !o), className: "flex items-center gap-2 w-full px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800", children: [_jsx(ChevronDown, { className: cn("h-3 w-3 transition-transform", thinkingOpen && "rotate-180") }), "Extended thinking"] }), thinkingOpen && (_jsx("div", { className: "px-3 pb-3 text-xs text-zinc-500 dark:text-zinc-400 font-mono whitespace-pre-wrap border-t border-zinc-200 dark:border-zinc-700 pt-2", children: message.thinking }))] })), message.isStreaming && !message.content ? (_jsxs("div", { className: "flex gap-1 py-2", "data-testid": "streaming-indicator", children: [_jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" }), _jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" }), _jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" })] })) : (_jsx(MessageContent, { content: message.content })), !isUser && !message.isStreaming && (_jsxs("div", { className: "flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity", children: [message.inputTokens !== undefined && (_jsxs("span", { className: "text-xs text-zinc-400 dark:text-zinc-500", children: ["\u2191 ", formatTokens(message.inputTokens), " \u2193 ", formatTokens(message.outputTokens ?? 0)] })), message.stopReason === "interrupted" && (_jsx(Badge, { variant: "warning", children: "interrupted" })), _jsx(Tooltip, { content: copied ? "Copied!" : "Copy", children: _jsx(Button, { variant: "ghost", size: "icon", onClick: copy, className: "h-6 w-6", children: copied ? _jsx(Check, { className: "h-3 w-3" }) : _jsx(Copy, { className: "h-3 w-3" }) }) })] }))] })] }));
}
