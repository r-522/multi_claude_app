import { eq, desc } from "drizzle-orm";
import type { DrizzleDb } from "~/shared/lib/db/client";
import { tasks } from "~/shared/lib/db/schema";
import type { Task, NewTask } from "~/shared/lib/db/schema";
import { nanoid } from "~/shared/lib/utils";
import type { ModelId } from "~/shared/types/claude";

export type TaskStatus = Task["status"];

export class TaskRepository {
  constructor(private readonly db: DrizzleDb) {}

  async findById(id: string): Promise<Task | undefined> {
    return this.db.query.tasks.findFirst({
      where: eq(tasks.id, id),
    });
  }

  async listByUser(userId: string): Promise<Task[]> {
    return this.db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt))
      .limit(50);
  }

  async create(data: {
    goal: string;
    model: ModelId;
    userId?: string;
  }): Promise<Task> {
    const now = new Date();
    const row: NewTask = {
      id: nanoid(),
      userId: data.userId ?? "default",
      goal: data.goal,
      status: "decomposing",
      model: data.model,
      totalSubTasks: 0,
      completedSubTasks: 0,
      failedSubTasks: 0,
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    };
    await this.db.insert(tasks).values(row);
    return row as Task;
  }

  async updateStatus(id: string, status: TaskStatus): Promise<void> {
    await this.db
      .update(tasks)
      .set({
        status,
        updatedAt: new Date(),
        completedAt: status === "completed" ? new Date() : undefined,
      })
      .where(eq(tasks.id, id));
  }

  async updateSubTaskCounts(
    id: string,
    total: number,
    completed: number,
    failed: number,
  ): Promise<void> {
    await this.db
      .update(tasks)
      .set({ totalSubTasks: total, completedSubTasks: completed, failedSubTasks: failed, updatedAt: new Date() })
      .where(eq(tasks.id, id));
  }
}
