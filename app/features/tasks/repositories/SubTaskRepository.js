import { eq, asc } from "drizzle-orm";
import { subTasks } from "~/shared/lib/db/schema";
import { nanoid } from "~/shared/lib/utils";
export class SubTaskRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async findById(id) {
        return this.db.query.subTasks.findFirst({
            where: eq(subTasks.id, id),
        });
    }
    async listByTask(taskId) {
        return this.db
            .select()
            .from(subTasks)
            .where(eq(subTasks.taskId, taskId))
            .orderBy(asc(subTasks.sequenceIndex));
    }
    async createMany(taskId, items) {
        const now = new Date();
        const rows = items.map((item, i) => ({
            id: nanoid(),
            taskId,
            sequenceIndex: i,
            title: item.title,
            description: item.description,
            status: "todo",
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
        return rows;
    }
    async updateStatus(id, status) {
        await this.db
            .update(subTasks)
            .set({
            status,
            startedAt: status === "doing" ? new Date() : undefined,
            completedAt: status === "done" || status === "failed" ? new Date() : undefined,
        })
            .where(eq(subTasks.id, id));
    }
    async savePhaseOutput(id, phase, output, tokens) {
        const field = `${phase}Output`;
        await this.db
            .update(subTasks)
            .set({
            [field]: output,
            inputTokens: tokens.input,
            outputTokens: tokens.output,
        })
            .where(eq(subTasks.id, id));
    }
    async incrementRetry(id) {
        const st = await this.findById(id);
        if (!st)
            return;
        await this.db
            .update(subTasks)
            .set({ retryCount: st.retryCount + 1, status: "retry" })
            .where(eq(subTasks.id, id));
    }
}
