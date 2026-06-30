import { createClaudeClient } from "~/shared/lib/claude/client";
import { buildMessageParams, MODEL_REGISTRY } from "~/shared/lib/claude/models";
import { createDb } from "~/shared/lib/db/client";
import { TaskRepository } from "~/features/tasks/repositories/TaskRepository";
import { SubTaskRepository } from "~/features/tasks/repositories/SubTaskRepository";
import { TaskLogRepository } from "~/features/tasks/repositories/TaskLogRepository";
import { toAppError } from "~/shared/lib/errors";
const DECOMPOSE_SYSTEM = `Break this goal into 3–8 ordered, concrete sub-tasks. Each sub-task should be specific and actionable.
Return ONLY a JSON array: [{"title":"...","description":"..."},...]`;
const PLAN_SYSTEM = `You are planning how to accomplish a specific sub-task. Think through the approach step by step. Be specific and practical.`;
const EXECUTE_SYSTEM = `Execute the given sub-task following the provided plan. Produce the actual output — code, text, analysis, or whatever the task requires. Be thorough and complete.`;
const REVIEW_SYSTEM = `Review the execution output against the sub-task goal. Return ONLY valid JSON:
{"verdict":"pass","reason":"..."} or {"verdict":"fail","reason":"..."}
verdict is "pass" if the output completely and correctly accomplishes the task, "fail" otherwise.`;
const IMPROVE_SYSTEM = `The review found issues with the previous execution. Improve the output to address the specific issues mentioned. Return the complete improved output.`;
export class TaskService {
    env;
    taskRepo;
    subTaskRepo;
    logRepo;
    constructor(env) {
        this.env = env;
        const db = createDb(env.DB);
        this.taskRepo = new TaskRepository(db);
        this.subTaskRepo = new SubTaskRepository(db);
        this.logRepo = new TaskLogRepository(db);
    }
    async decompose(req) {
        const task = await this.taskRepo.create({ goal: req.goal, model: req.model });
        const claude = createClaudeClient(this.env);
        const params = buildMessageParams(MODEL_REGISTRY["claude-sonnet-4-6"], {
            messages: [{ role: "user", content: req.goal }],
            systemPrompt: DECOMPOSE_SYSTEM,
            maxTokens: 4096,
            effort: "medium",
        });
        try {
            const response = await claude.messages.create(params);
            const text = response.content[0].type === "text" ? response.content[0].text : "[]";
            const items = JSON.parse(text);
            const subTasks = await this.subTaskRepo.createMany(task.id, items.slice(0, 8));
            await this.taskRepo.updateStatus(task.id, "ready");
            await this.taskRepo.updateSubTaskCounts(task.id, subTasks.length, 0, 0);
            return { task: { ...task, status: "ready", totalSubTasks: subTasks.length }, subTasks };
        }
        catch (err) {
            await this.taskRepo.updateStatus(task.id, "failed");
            throw toAppError(err);
        }
    }
    async executePhase(subTaskId, phase, context = {}) {
        const subTask = await this.subTaskRepo.findById(subTaskId);
        if (!subTask)
            throw new Error("SubTask not found");
        const task = await this.taskRepo.findById(subTask.taskId);
        const model = (task?.model ?? "claude-opus-4-8");
        const [systemPrompt, userContent, callModel] = this.buildPhasePrompt(phase, subTask, context, model);
        const claude = createClaudeClient(this.env);
        const params = buildMessageParams(MODEL_REGISTRY[callModel], {
            messages: [{ role: "user", content: userContent }],
            systemPrompt,
            maxTokens: phase === "review" ? 512 : 16384,
            effort: phase === "review" ? "high" : "xhigh",
        });
        try {
            const response = await claude.messages.create(params);
            const output = response.content[0].type === "text" ? response.content[0].text : "";
            const inputTokens = response.usage.input_tokens;
            const outputTokens = response.usage.output_tokens;
            await this.subTaskRepo.savePhaseOutput(subTaskId, phase, output, { input: inputTokens, output: outputTokens });
            await this.logRepo.add({
                subTaskId,
                phase,
                level: "info",
                message: `${phase} phase completed`,
                data: { inputTokens, outputTokens, stopReason: response.stop_reason },
            });
            return { output, inputTokens, outputTokens };
        }
        catch (err) {
            await this.logRepo.add({
                subTaskId,
                phase,
                level: "error",
                message: `${phase} phase failed: ${err instanceof Error ? err.message : String(err)}`,
            });
            throw toAppError(err);
        }
    }
    buildPhasePrompt(phase, subTask, context, taskModel) {
        switch (phase) {
            case "plan":
                return [PLAN_SYSTEM, `Sub-task: ${subTask.title}\n\nDescription: ${subTask.description}`, "claude-opus-4-8"];
            case "execute":
                return [
                    EXECUTE_SYSTEM,
                    `Sub-task: ${subTask.title}\n\nDescription: ${subTask.description}\n\nPlan:\n${subTask.planOutput ?? context["plan"] ?? "No plan provided"}`,
                    "claude-opus-4-8",
                ];
            case "review":
                return [
                    REVIEW_SYSTEM,
                    `Sub-task: ${subTask.title}\n\nGoal: ${subTask.description}\n\nExecution output:\n${subTask.executeOutput ?? context["execute"] ?? ""}`,
                    "claude-sonnet-4-6",
                ];
            case "improve":
                return [
                    IMPROVE_SYSTEM,
                    `Sub-task: ${subTask.title}\n\nOriginal execution:\n${subTask.executeOutput ?? ""}\n\nReview issue:\n${context["reason"] ?? ""}`,
                    "claude-opus-4-8",
                ];
        }
    }
}
