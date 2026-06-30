import { redirect } from "@remix-run/cloudflare";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, Outlet } from "@remix-run/react";
import { createDb } from "~/shared/lib/db/client";
import { ConversationRepository } from "~/features/chat/repositories/ConversationRepository";
import { ConversationSidebar } from "~/features/chat/components/ConversationSidebar";
import { nanoid } from "~/shared/lib/utils";
import { GeneralErrorBoundary } from "~/shared/components/ErrorBoundary";
import type { Conversation } from "~/shared/lib/db/schema";

export async function loader({ context }: LoaderFunctionArgs) {
  const db = createDb(context.cloudflare.env.DB);
  const repo = new ConversationRepository(db);
  const conversations = await repo.listByUser("default");
  return { conversations };
}

export async function action({ context }: ActionFunctionArgs) {
  const db = createDb(context.cloudflare.env.DB);
  const repo = new ConversationRepository(db);
  const conv = await repo.create({ model: "claude-sonnet-4-6" });
  return redirect(`/chat/${conv.id}`);
}

export default function ChatLayout() {
  const { conversations } = useLoaderData<{ conversations: Conversation[] }>();

  return (
    <div className="flex h-full">
      <ConversationSidebar
        conversations={conversations}
        onNew={() => {
          const form = document.createElement("form");
          form.method = "post";
          form.action = "/chat";
          document.body.appendChild(form);
          form.submit();
          document.body.removeChild(form);
        }}
      />
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}

export { GeneralErrorBoundary as ErrorBoundary };
