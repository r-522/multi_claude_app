import { eq, asc } from "drizzle-orm";
import { taskLogs } from "~/shared/lib/db/schema";
import { nanoid } from "~/shared/lib/utils";
export class TaskLogRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async listBySubTask(subTaskId) {
        return this.db
            .select()
            .from(taskLogs)
            .where(eq(taskLogs.subTaskId, subTaskId))
            .orderBy(asc(taskLogs.createdAt));
    }
    async add(data) {
        const row = {
            id: nanoid(),
            subTaskId: data.subTaskId,
            phase: data.phase,
            level: data.level,
            message: data.message,
            data: data.data ? JSON.stringify(data.data) : null,
            createdAt: new Date(),
        };
        await this.db.insert(taskLogs).values(row);
        return row;
    }
}
