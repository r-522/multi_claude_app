import { jsx as _jsx } from "react/jsx-runtime";
import { redirect } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { createDb } from "~/shared/lib/db/client";
import { ConversationRepository } from "~/features/chat/repositories/ConversationRepository";
import { MessageRepository } from "~/features/chat/repositories/MessageRepository";
import { ChatPanel } from "~/features/chat/components/ChatPanel";
import { GeneralErrorBoundary } from "~/shared/components/ErrorBoundary";
export async function loader({ params, context }) {
    const id = params.id;
    if (!id)
        throw redirect("/chat");
    const db = createDb(context.cloudflare.env.DB);
    const convRepo = new ConversationRepository(db);
    const msgRepo = new MessageRepository(db);
    const conversation = await convRepo.findById(id);
    if (!conversation)
        throw redirect("/chat");
    const messages = await msgRepo.listByConversation(id);
    return { conversation, messages };
}
export async function action({ params, request, context }) {
    const id = params.id;
    if (!id)
        throw redirect("/chat");
    const url = new URL(request.url);
    if (url.pathname.endsWith("/delete")) {
        const db = createDb(context.cloudflare.env.DB);
        const repo = new ConversationRepository(db);
        await repo.softDelete(id);
        return redirect("/chat");
    }
    return null;
}
export default function ChatConversation() {
    const { conversation, messages } = useLoaderData();
    return _jsx(ChatPanel, { conversation: conversation, initialMessages: messages });
}
export { GeneralErrorBoundary as ErrorBoundary };
