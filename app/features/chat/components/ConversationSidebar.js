import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useFetcher } from "@remix-run/react";
import { Plus, Trash2, MessageSquare } from "lucide-react";
import { Button } from "~/shared/components/ui/Button";
import { ScrollArea } from "~/shared/components/ui/ScrollArea";
import { formatDate } from "~/shared/lib/utils";
import { cn } from "~/shared/lib/utils";
export function ConversationSidebar({ conversations, currentId, onNew }) {
    const fetcher = useFetcher();
    return (_jsxs("div", { className: "flex flex-col h-full w-[260px] border-r border-zinc-200 dark:border-zinc-800", children: [_jsxs("div", { className: "flex items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-800", children: [_jsx("span", { className: "text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide", children: "Conversations" }), _jsx(Button, { variant: "ghost", size: "icon", onClick: onNew, className: "h-7 w-7", children: _jsx(Plus, { className: "h-3.5 w-3.5" }) })] }), _jsx(ScrollArea, { className: "flex-1", children: _jsxs("div", { className: "p-2 flex flex-col gap-0.5", children: [conversations.length === 0 && (_jsx("div", { className: "text-center py-8 text-xs text-zinc-400 dark:text-zinc-600", children: "No conversations yet" })), conversations.map((conv) => (_jsxs("div", { className: cn("group flex items-center gap-2 px-2.5 py-2 rounded-md cursor-pointer transition-colors", currentId === conv.id
                                ? "bg-zinc-100 dark:bg-zinc-800"
                                : "hover:bg-zinc-50 dark:hover:bg-zinc-900"), children: [_jsx(MessageSquare, { className: "h-3.5 w-3.5 text-zinc-400 shrink-0" }), _jsxs(Link, { to: `/chat/${conv.id}`, className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm truncate text-zinc-700 dark:text-zinc-300", children: conv.title || "New conversation" }), _jsx("p", { className: "text-xs text-zinc-400 dark:text-zinc-600 mt-0.5", children: formatDate(conv.updatedAt) })] }), _jsx(fetcher.Form, { method: "post", action: `/chat/${conv.id}/delete`, children: _jsx(Button, { type: "submit", variant: "ghost", size: "icon", className: "h-6 w-6 opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500", children: _jsx(Trash2, { className: "h-3 w-3" }) }) })] }, conv.id)))] }) })] }));
}
