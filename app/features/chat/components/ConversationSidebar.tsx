import { Link, useFetcher } from "@remix-run/react";
import { Plus, Trash2, MessageSquare } from "lucide-react";
import { Button } from "~/shared/components/ui/Button";
import { ScrollArea } from "~/shared/components/ui/ScrollArea";
import { formatDate } from "~/shared/lib/utils";
import { cn } from "~/shared/lib/utils";
import type { Conversation } from "~/shared/lib/db/schema";

interface ConversationSidebarProps {
  conversations: Conversation[];
  currentId?: string;
  onNew: () => void;
}

export function ConversationSidebar({ conversations, currentId, onNew }: ConversationSidebarProps) {
  const fetcher = useFetcher();

  return (
    <div className="flex flex-col h-full w-[260px] border-r border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-800">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
          Conversations
        </span>
        <Button variant="ghost" size="icon" onClick={onNew} className="h-7 w-7">
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 flex flex-col gap-0.5">
          {conversations.length === 0 && (
            <div className="text-center py-8 text-xs text-zinc-400 dark:text-zinc-600">
              No conversations yet
            </div>
          )}
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                "group flex items-center gap-2 px-2.5 py-2 rounded-md cursor-pointer transition-colors",
                currentId === conv.id
                  ? "bg-zinc-100 dark:bg-zinc-800"
                  : "hover:bg-zinc-50 dark:hover:bg-zinc-900",
              )}
            >
              <MessageSquare className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
              <Link to={`/chat/${conv.id}`} className="flex-1 min-w-0">
                <p className="text-sm truncate text-zinc-700 dark:text-zinc-300">
                  {conv.title || "New conversation"}
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-0.5">
                  {formatDate(conv.updatedAt)}
                </p>
              </Link>
              <fetcher.Form method="post" action={`/chat/${conv.id}/delete`}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </fetcher.Form>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
