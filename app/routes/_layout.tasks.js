import { jsx as _jsx } from "react/jsx-runtime";
import { TasksPanel } from "~/features/tasks/components/TasksPanel";
import { GeneralErrorBoundary } from "~/shared/components/ErrorBoundary";
export default function TasksRoute() {
    return _jsx(TasksPanel, {});
}
export { GeneralErrorBoundary as ErrorBoundary };
