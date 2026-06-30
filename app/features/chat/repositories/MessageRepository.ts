import { eq, asc } from "drizzle-orm";
import type { DrizzleDb } from "~/shared/lib/db/client";
import { messages } from "~/shared/lib/db/schema";
import type { Message, NewMessage } from "~/shared/lib/db/schema";
import { nanoid } from "~/shared/lib/utils";
import type { CoreMessage } from "~/shared/types/claude";

export class MessageRepository {
  constructor(private readonly db: DrizzleDb) {}

  async listByConversation(conversationId: string): Promise<Message[]> {
    return this.db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt));
  }

  async toCoreMessages(conversationId: string): Promise<CoreMessage[]> {
    const msgs = await this.listByConversation(conversationId);
    return msgs.map((m) => ({ role: m.role, content: m.content }));
  }

  async create(data: {
    conversationId: string;
    role: "user" | "assistant";
    content: string;
    thinking?: string;
    inputTokens?: number;
    outputTokens?: number;
    model?: string;
    stopReason?: string;
  }): Promise<Message> {
    const row: NewMessage = {
      id: nanoid(),
      conversationId: data.conversationId,
      role: data.role,
      content: data.content,
      thinking: data.thinking ?? null,
      inputTokens: data.inputTokens ?? 0,
      outputTokens: data.outputTokens ?? 0,
      model: data.model ?? "",
      stopReason: data.stopReason ?? "",
      createdAt: new Date(),
    };
    await this.db.insert(messages).values(row);
    return row as Message;
  }
}
