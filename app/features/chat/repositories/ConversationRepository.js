import { eq, and, isNull, desc } from "drizzle-orm";
import { conversations } from "~/shared/lib/db/schema";
import { nanoid } from "~/shared/lib/utils";
import { DEFAULT_MAX_TOKENS } from "~/shared/lib/claude/models";
export class ConversationRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async findById(id) {
        return this.db.query.conversations.findFirst({
            where: eq(conversations.id, id),
        });
    }
    async listByUser(userId) {
        return this.db
            .select()
            .from(conversations)
            .where(and(eq(conversations.userId, userId), isNull(conversations.deletedAt)))
            .orderBy(desc(conversations.updatedAt))
            .limit(100);
    }
    async create(data) {
        const now = new Date();
        const row = {
            id: nanoid(),
            userId: data.userId ?? "default",
            title: "",
            model: data.model,
            systemPrompt: data.systemPrompt ?? "",
            temperature: data.temperature ?? null,
            maxTokens: data.maxTokens ?? DEFAULT_MAX_TOKENS,
            messageCount: 0,
            totalInputTokens: 0,
            totalOutputTokens: 0,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
        };
        await this.db.insert(conversations).values(row);
        return row;
    }
    async updateTitle(id, title) {
        await this.db
            .update(conversations)
            .set({ title, updatedAt: new Date() })
            .where(eq(conversations.id, id));
    }
    async incrementTokens(id, inputTokens, outputTokens) {
        const conv = await this.findById(id);
        if (!conv)
            return;
        await this.db
            .update(conversations)
            .set({
            messageCount: conv.messageCount + 1,
            totalInputTokens: conv.totalInputTokens + inputTokens,
            totalOutputTokens: conv.totalOutputTokens + outputTokens,
            updatedAt: new Date(),
        })
            .where(eq(conversations.id, id));
    }
    async softDelete(id) {
        await this.db
            .update(conversations)
            .set({ deletedAt: new Date() })
            .where(eq(conversations.id, id));
    }
}
