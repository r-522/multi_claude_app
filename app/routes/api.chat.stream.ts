import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { ChatStreamRequestSchema } from "~/features/chat/schemas/chat.schema";
import { ChatService } from "~/features/chat/services/ChatService";
import { toAppError } from "~/shared/lib/errors";

export async function action({ request, context }: ActionFunctionArgs) {
  try {
    const body = await request.json();
    const data = ChatStreamRequestSchema.parse(body);
    const service = new ChatService(context.cloudflare.env);
    return service.stream(data);
  } catch (err) {
    const appErr = toAppError(err);
    return appErr.toResponse();
  }
}
