import { eq, desc } from "drizzle-orm";
import { promptEntries } from "~/shared/lib/db/schema";
import { nanoid } from "~/shared/lib/utils";
export class PromptRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async findById(id) {
        return this.db.query.promptEntries.findFirst({
            where: eq(promptEntries.id, id),
        });
    }
    async listByUser(userId, limit = 50) {
        return this.db
            .select()
            .from(promptEntries)
            .where(eq(promptEntries.userId, userId))
            .orderBy(desc(promptEntries.createdAt))
            .limit(limit);
    }
    async create(data) {
        const row = {
            id: nanoid(),
            userId: data.userId ?? "default",
            rawInput: data.rawInput,
            analysis: JSON.stringify(data.analysis),
            simpleOutput: data.builtPrompt.simple,
            standardOutput: data.builtPrompt.standard,
            professionalOutput: data.builtPrompt.professional,
            researchOutput: data.builtPrompt.research,
            improvements: JSON.stringify(data.analysis.improvements),
            model: data.model,
            inputTokens: data.inputTokens,
            outputTokens: data.outputTokens,
            isFavorite: false,
            createdAt: new Date(),
        };
        await this.db.insert(promptEntries).values(row);
        return row;
    }
    async toggleFavorite(id, isFavorite) {
        await this.db
            .update(promptEntries)
            .set({ isFavorite })
            .where(eq(promptEntries.id, id));
    }
}
