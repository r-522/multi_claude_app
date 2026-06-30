import { eq, and, isNull, desc } from "drizzle-orm";
import type { DrizzleDb } from "~/shared/lib/db/client";
import { conversations } from "~/shared/lib/db/schema";
import type { Conversation, NewConversation } from "~/shared/lib/db/schema";
import { nanoid } from "~/shared/lib/utils";
import { DEFAULT_MAX_TOKENS } from "~/shared/lib/claude/models";
import type { ModelId } from "~/shared/types/claude";

export class ConversationRepository {
  constructor(private readonly db: DrizzleDb) {}

  async findById(id: string): Promise<Conversation | undefined> {
    return this.db.query.conversations.findFirst({
      where: eq(conversations.id, id),
    });
  }

  async listByUser(userId: string): Promise<Conversation[]> {
    return this.db
      .select()
      .from(conversations)
      .where(and(eq(conversations.userId, userId), isNull(conversations.deletedAt)))
      .orderBy(desc(conversations.updatedAt))
      .limit(100);
  }

  async create(data: {
    model: ModelId;
    userId?: string;
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<Conversation> {
    const now = new Date();
    const row: NewConversation = {
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
    return row as Conversation;
  }

  async updateTitle(id: string, title: string): Promise<void> {
    await this.db
      .update(conversations)
      .set({ title, updatedAt: new Date() })
      .where(eq(conversations.id, id));
  }

  async incrementTokens(
    id: string,
    inputTokens: number,
    outputTokens: number,
  ): Promise<void> {
    const conv = await this.findById(id);
    if (!conv) return;
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

  async softDelete(id: string): Promise<void> {
    await this.db
      .update(conversations)
      .set({ deletedAt: new Date() })
      .where(eq(conversations.id, id));
  }
}
