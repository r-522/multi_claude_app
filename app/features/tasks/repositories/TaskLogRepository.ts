import { eq, asc } from "drizzle-orm";
import type { DrizzleDb } from "~/shared/lib/db/client";
import { taskLogs } from "~/shared/lib/db/schema";
import type { TaskLog, NewTaskLog } from "~/shared/lib/db/schema";
import { nanoid } from "~/shared/lib/utils";

export type TaskLogPhase = TaskLog["phase"];
export type TaskLogLevel = TaskLog["level"];

export class TaskLogRepository {
  constructor(private readonly db: DrizzleDb) {}

  async listBySubTask(subTaskId: string): Promise<TaskLog[]> {
    return this.db
      .select()
      .from(taskLogs)
      .where(eq(taskLogs.subTaskId, subTaskId))
      .orderBy(asc(taskLogs.createdAt));
  }

  async add(data: {
    subTaskId: string;
    phase: TaskLogPhase;
    level: TaskLogLevel;
    message: string;
    data?: Record<string, unknown>;
  }): Promise<TaskLog> {
    const row: NewTaskLog = {
      id: nanoid(),
      subTaskId: data.subTaskId,
      phase: data.phase,
      level: data.level,
      message: data.message,
      data: data.data ? JSON.stringify(data.data) : null,
      createdAt: new Date(),
    };
    await this.db.insert(taskLogs).values(row);
    return row as TaskLog;
  }
}
