import { eq, asc } from "drizzle-orm";
import { messages } from "~/shared/lib/db/schema";
import { nanoid } from "~/shared/lib/utils";
export class MessageRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async listByConversation(conversationId) {
        return this.db
            .select()
            .from(messages)
            .where(eq(messages.conversationId, conversationId))
            .orderBy(asc(messages.createdAt));
    }
    async toCoreMessages(conversationId) {
        const msgs = await this.listByConversation(conversationId);
        return msgs.map((m) => ({ role: m.role, content: m.content }));
    }
    async create(data) {
        const row = {
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
        return row;
    }
}
