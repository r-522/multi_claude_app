import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "@remix-run/react";
import { Textarea } from "~/shared/components/ui/Textarea";
import { Button } from "~/shared/components/ui/Button";
import { TaskStateIndicator } from "./TaskStateIndicator";
import { useTaskExecution } from "~/features/tasks/hooks/useTaskExecution";
import { CheckSquare, Play, Pause, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "~/shared/lib/utils";
export function TasksPanel({ task, subTasks: initialSubTasks }) {
    const navigate = useNavigate();
    const [goal, setGoal] = useState("");
    const [decomposing, setDecomposing] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const { execState, subTasks, currentSubTaskId, currentPhase, start, pause, resume } = useTaskExecution(task?.id ?? "", initialSubTasks ?? []);
    const handleDecompose = async () => {
        if (!goal.trim())
            return;
        setDecomposing(true);
        try {
            const res = await fetch("/api/tasks/decompose", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ goal }),
            });
            if (!res.ok)
                throw new Error("Decomposition failed");
            const data = await res.json();
            navigate(`/tasks/${data.task.id}`);
        }
        finally {
            setDecomposing(false);
        }
    };
    const completedCount = subTasks.filter((s) => s.status === "done").length;
    const progress = subTasks.length > 0 ? (completedCount / subTasks.length) * 100 : 0;
    return (_jsxs("div", { className: "flex flex-col h-full", children: [_jsxs("div", { className: "flex items-center gap-2 h-12 px-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0", children: [_jsx(CheckSquare, { className: "h-4 w-4 text-indigo-500" }), _jsx("h1", { className: "text-sm font-semibold text-zinc-900 dark:text-zinc-100", children: "Tasks" })] }), _jsx("div", { className: "flex-1 overflow-auto p-6", children: _jsxs("div", { className: "max-w-2xl mx-auto flex flex-col gap-6", children: [!task && (
                        /* Goal input */
                        _jsxs("div", { className: "flex flex-col gap-3", children: [_jsx("label", { className: "text-sm font-medium text-zinc-700 dark:text-zinc-300", children: "What do you want to accomplish?" }), _jsx(Textarea, { value: goal, onChange: (e) => setGoal(e.target.value), placeholder: "Describe your goal in detail\u2026", rows: 4, disabled: decomposing }), _jsx(Button, { variant: "primary", onClick: handleDecompose, loading: decomposing, disabled: !goal.trim(), className: "self-end", children: "Decompose goal" })] })), task && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1", children: "Goal" }), _jsx("p", { className: "text-sm text-zinc-700 dark:text-zinc-300", children: task.goal })] }), subTasks.length > 0 && (_jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsxs("div", { className: "flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400", children: [_jsxs("span", { children: [completedCount, " / ", subTasks.length, " complete"] }), _jsxs("span", { children: [Math.round(progress), "%"] })] }), _jsx("div", { className: "h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-indigo-500 rounded-full transition-all duration-300", style: { width: `${progress}%` } }) })] })), _jsxs("div", { className: "flex gap-2", children: [execState === "idle" && (_jsxs(Button, { variant: "primary", onClick: start, className: "gap-2", children: [_jsx(Play, { className: "h-3.5 w-3.5" }), "Start execution"] })), execState === "running" && (_jsxs(Button, { variant: "secondary", onClick: pause, className: "gap-2", children: [_jsx(Pause, { className: "h-3.5 w-3.5" }), "Pause"] })), execState === "paused" && (_jsxs(Button, { variant: "primary", onClick: resume, className: "gap-2", children: [_jsx(Play, { className: "h-3.5 w-3.5" }), "Resume"] })), execState === "completed" && (_jsx("div", { className: "text-sm text-green-600 dark:text-green-400 font-medium", children: "\u2713 All tasks completed" }))] }), _jsx("div", { className: "flex flex-col gap-2", children: subTasks.map((st, i) => (_jsxs("div", { className: "rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden", children: [_jsxs("button", { onClick: () => setExpandedId((id) => id === st.id ? null : st.id), className: cn("flex items-center gap-3 w-full px-4 py-3 text-left", "hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors", currentSubTaskId === st.id && "bg-indigo-50 dark:bg-indigo-950"), children: [_jsx("span", { className: "text-xs text-zinc-400 w-4", children: i + 1 }), _jsxs("span", { className: "flex-1 text-sm text-zinc-700 dark:text-zinc-300 font-medium", children: [st.title, currentSubTaskId === st.id && currentPhase && (_jsxs("span", { className: "ml-2 text-xs text-indigo-500 font-normal animate-pulse", children: [currentPhase, "\u2026"] }))] }), _jsx(TaskStateIndicator, { status: st.status }), expandedId === st.id ? (_jsx(ChevronDown, { className: "h-3.5 w-3.5 text-zinc-400 shrink-0" })) : (_jsx(ChevronRight, { className: "h-3.5 w-3.5 text-zinc-400 shrink-0" }))] }), expandedId === st.id && (_jsxs("div", { className: "border-t border-zinc-200 dark:border-zinc-700 p-4 flex flex-col gap-3 text-sm", children: [_jsx("p", { className: "text-zinc-600 dark:text-zinc-400", children: st.description }), st.executeOutput && (_jsxs("div", { children: [_jsx("p", { className: "text-xs font-medium text-zinc-500 mb-1", children: "Output" }), _jsx("pre", { className: "text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed bg-zinc-50 dark:bg-zinc-900 rounded-md p-3", children: st.executeOutput })] })), st.errorMessage && (_jsx("p", { className: "text-xs text-red-500", children: st.errorMessage }))] }))] }, st.id))) })] }))] }) })] }));
}
