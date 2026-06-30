import { eq, desc } from "drizzle-orm";
import type { DrizzleDb } from "~/shared/lib/db/client";
import { promptEntries } from "~/shared/lib/db/schema";
import type { PromptEntry, NewPromptEntry } from "~/shared/lib/db/schema";
import { nanoid } from "~/shared/lib/utils";
import type { ModelId } from "~/shared/types/claude";

export interface PromptAnalysis {
  purpose: string;
  constraints: string[];
  expectedOutput: string;
  missingInfo: string[];
  improvements: string[];
}

export interface BuiltPromptData {
  simple: string;
  standard: string;
  professional: string;
  research: string;
  reasoning: string;
}

export class PromptRepository {
  constructor(private readonly db: DrizzleDb) {}

  async findById(id: string): Promise<PromptEntry | undefined> {
    return this.db.query.promptEntries.findFirst({
      where: eq(promptEntries.id, id),
    });
  }

  async listByUser(userId: string, limit = 50): Promise<PromptEntry[]> {
    return this.db
      .select()
      .from(promptEntries)
      .where(eq(promptEntries.userId, userId))
      .orderBy(desc(promptEntries.createdAt))
      .limit(limit);
  }

  async create(data: {
    rawInput: string;
    analysis: PromptAnalysis;
    builtPrompt: BuiltPromptData;
    model: ModelId;
    inputTokens: number;
    outputTokens: number;
    userId?: string;
  }): Promise<PromptEntry> {
    const row: NewPromptEntry = {
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
    return row as PromptEntry;
  }

  async toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
    await this.db
      .update(promptEntries)
      .set({ isFavorite })
      .where(eq(promptEntries.id, id));
  }
}
