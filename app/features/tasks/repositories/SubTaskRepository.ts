import { eq, asc } from "drizzle-orm";
import type { DrizzleDb } from "~/shared/lib/db/client";
import { subTasks } from "~/shared/lib/db/schema";
import type { SubTask, NewSubTask } from "~/shared/lib/db/schema";
import { nanoid } from "~/shared/lib/utils";

export type SubTaskStatus = SubTask["status"];

export class SubTaskRepository {
  constructor(private readonly db: DrizzleDb) {}

  async findById(id: string): Promise<SubTask | undefined> {
    return this.db.query.subTasks.findFirst({
      where: eq(subTasks.id, id),
    });
  }

  async listByTask(taskId: string): Promise<SubTask[]> {
    return this.db
      .select()
      .from(subTasks)
      .where(eq(subTasks.taskId, taskId))
      .orderBy(asc(subTasks.sequenceIndex));
  }

  async createMany(
    taskId: string,
    items: Array<{ title: string; description: string }>,
  ): Promise<SubTask[]> {
    const now = new Date();
    const rows: NewSubTask[] = items.map((item, i) => ({
      id: nanoid(),
      taskId,
      sequenceIndex: i,
      title: item.title,
      description: item.description,
      status: "todo" as const,
      retryCount: 0,
      maxRetries: 2,
      planOutput: null,
      executeOutput: null,
      reviewOutput: null,
      improveOutput: null,
      inputTokens: 0,
      outputTokens: 0,
      errorMessage: null,
      startedAt: null,
      completedAt: null,
      createdAt: now,
    }));
    await this.db.insert(subTasks).values(rows);
    return rows as SubTask[];
  }

  async updateStatus(id: string, status: SubTaskStatus): Promise<void> {
    await this.db
      .update(subTasks)
      .set({
        status,
        startedAt: status === "doing" ? new Date() : undefined,
        completedAt: status === "done" || status === "failed" ? new Date() : undefined,
      })
      .where(eq(subTasks.id, id));
  }

  async savePhaseOutput(
    id: string,
    phase: "plan" | "execute" | "review" | "improve",
    output: string,
    tokens: { input: number; output: number },
  ): Promise<void> {
    const field = `${phase}Output` as const;
    await this.db
      .update(subTasks)
      .set({
        [field]: output,
        inputTokens: tokens.input,
        outputTokens: tokens.output,
      })
      .where(eq(subTasks.id, id));
  }

  async incrementRetry(id: string): Promise<void> {
    const st = await this.findById(id);
    if (!st) return;
    await this.db
      .update(subTasks)
      .set({ retryCount: st.retryCount + 1, status: "retry" })
      .where(eq(subTasks.id, id));
  }
}
