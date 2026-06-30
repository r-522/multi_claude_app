import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { ChatStopRequestSchema } from "~/features/chat/schemas/chat.schema";
import { KVClient } from "~/shared/lib/kv/client";
import { toAppError } from "~/shared/lib/errors";

export async function action({ request, context }: ActionFunctionArgs) {
  try {
    const body = await request.json();
    const { conversationId } = ChatStopRequestSchema.parse(body);
    const kv = new KVClient(context.cloudflare.env.KV);
    await kv.setAbortFlag(conversationId, { ttlSeconds: 60 });
    return new Response(null, { status: 204 });
  } catch (err) {
    const appErr = toAppError(err);
    return appErr.toResponse();
  }
}
