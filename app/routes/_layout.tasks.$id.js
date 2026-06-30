import { jsx as _jsx } from "react/jsx-runtime";
import { redirect } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { createDb } from "~/shared/lib/db/client";
import { TaskRepository } from "~/features/tasks/repositories/TaskRepository";
import { SubTaskRepository } from "~/features/tasks/repositories/SubTaskRepository";
import { TasksPanel } from "~/features/tasks/components/TasksPanel";
import { GeneralErrorBoundary } from "~/shared/components/ErrorBoundary";
export async function loader({ params, context }) {
    const id = params.id;
    if (!id)
        throw redirect("/tasks");
    const db = createDb(context.cloudflare.env.DB);
    const taskRepo = new TaskRepository(db);
    const subTaskRepo = new SubTaskRepository(db);
    const task = await taskRepo.findById(id);
    if (!task)
        throw redirect("/tasks");
    const subTasks = await subTaskRepo.listByTask(id);
    return { task, subTasks };
}
export default function TaskDetailRoute() {
    const { task, subTasks } = useLoaderData();
    return _jsx(TasksPanel, { task: task, subTasks: subTasks });
}
export { GeneralErrorBoundary as ErrorBoundary };
