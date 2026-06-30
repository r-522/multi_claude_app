import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { redirect } from "@remix-run/cloudflare";
import { useLoaderData, Outlet } from "@remix-run/react";
import { createDb } from "~/shared/lib/db/client";
import { ConversationRepository } from "~/features/chat/repositories/ConversationRepository";
import { ConversationSidebar } from "~/features/chat/components/ConversationSidebar";
import { GeneralErrorBoundary } from "~/shared/components/ErrorBoundary";
export async function loader({ context }) {
    const db = createDb(context.cloudflare.env.DB);
    const repo = new ConversationRepository(db);
    const conversations = await repo.listByUser("default");
    return { conversations };
}
export async function action({ context }) {
    const db = createDb(context.cloudflare.env.DB);
    const repo = new ConversationRepository(db);
    const conv = await repo.create({ model: "claude-sonnet-4-6" });
    return redirect(`/chat/${conv.id}`);
}
export default function ChatLayout() {
    const { conversations } = useLoaderData();
    return (_jsxs("div", { className: "flex h-full", children: [_jsx(ConversationSidebar, { conversations: conversations, onNew: () => {
                    const form = document.createElement("form");
                    form.method = "post";
                    form.action = "/chat";
                    document.body.appendChild(form);
                    form.submit();
                    document.body.removeChild(form);
                } }), _jsx("div", { className: "flex-1 overflow-hidden", children: _jsx(Outlet, {}) })] }));
}
export { GeneralErrorBoundary as ErrorBoundary };
