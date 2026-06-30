import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useCallback } from "react";
import { SendHorizonal, Square } from "lucide-react";
import { Textarea } from "~/shared/components/ui/Textarea";
import { Button } from "~/shared/components/ui/Button";
import { cn } from "~/shared/lib/utils";
export function ChatInput({ onSend, onStop, isStreaming, disabled }) {
    const ref = useRef(null);
    const send = useCallback(() => {
        const value = ref.current?.value.trim();
        if (!value || isStreaming)
            return;
        ref.current.value = "";
        ref.current.style.height = "auto";
        onSend(value);
    }, [isStreaming, onSend]);
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
        if (e.key === "Escape" && isStreaming) {
            onStop();
        }
    };
    return (_jsxs("div", { className: "border-t border-zinc-200 dark:border-zinc-800 p-4", children: [_jsxs("div", { className: cn("flex items-end gap-2 rounded-xl border bg-white dark:bg-zinc-900", "border-zinc-200 dark:border-zinc-700", "focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500", "px-3 py-2 transition-shadow"), children: [_jsx(Textarea, { ref: ref, autoResize: true, placeholder: "Message Claude\u2026", onKeyDown: handleKeyDown, disabled: disabled, rows: 1, className: cn("flex-1 border-none bg-transparent focus:ring-0 p-0 resize-none min-h-[24px] max-h-[200px]", "text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"), "data-testid": "chat-input" }), isStreaming ? (_jsx(Button, { variant: "ghost", size: "icon", onClick: onStop, className: "shrink-0 h-8 w-8 text-zinc-500 hover:text-red-500", children: _jsx(Square, { className: "h-4 w-4 fill-current" }) })) : (_jsx(Button, { variant: "primary", size: "icon", onClick: send, disabled: disabled, className: "shrink-0 h-8 w-8", children: _jsx(SendHorizonal, { className: "h-4 w-4" }) }))] }), _jsx("p", { className: "text-center text-[11px] text-zinc-400 dark:text-zinc-600 mt-2", children: "Enter to send \u00B7 Shift+Enter for newline \u00B7 Esc to stop" })] }));
}
