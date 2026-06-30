import { eq, desc } from "drizzle-orm";
import { tasks } from "~/shared/lib/db/schema";
import { nanoid } from "~/shared/lib/utils";
export class TaskRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async findById(id) {
        return this.db.query.tasks.findFirst({
            where: eq(tasks.id, id),
        });
    }
    async listByUser(userId) {
        return this.db
            .select()
            .from(tasks)
            .where(eq(tasks.userId, userId))
            .orderBy(desc(tasks.createdAt))
            .limit(50);
    }
    async create(data) {
        const now = new Date();
        const row = {
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
        return row;
    }
    async updateStatus(id, status) {
        await this.db
            .update(tasks)
            .set({
            status,
            updatedAt: new Date(),
            completedAt: status === "completed" ? new Date() : undefined,
        })
            .where(eq(tasks.id, id));
    }
    async updateSubTaskCounts(id, total, completed, failed) {
        await this.db
            .update(tasks)
            .set({ totalSubTasks: total, completedSubTasks: completed, failedSubTasks: failed, updatedAt: new Date() })
            .where(eq(tasks.id, id));
    }
}
