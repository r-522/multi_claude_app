import { TasksPanel } from "~/features/tasks/components/TasksPanel";
import { GeneralErrorBoundary } from "~/shared/components/ErrorBoundary";

export default function TasksRoute() {
  return <TasksPanel />;
}

export { GeneralErrorBoundary as ErrorBoundary };
