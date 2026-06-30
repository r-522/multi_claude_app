import { useState } from "react";
import { useNavigate } from "@remix-run/react";
import { Textarea } from "~/shared/components/ui/Textarea";
import { Button } from "~/shared/components/ui/Button";
import { TaskStateIndicator } from "./TaskStateIndicator";
import { useTaskExecution } from "~/features/tasks/hooks/useTaskExecution";
import { CheckSquare, Play, Pause, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "~/shared/lib/utils";
import type { Task, SubTask } from "~/shared/lib/db/schema";

interface TasksPanelProps {
  task?: Task;
  subTasks?: SubTask[];
}

export function TasksPanel({ task, subTasks: initialSubTasks }: TasksPanelProps) {
  const navigate = useNavigate();
  const [goal, setGoal] = useState("");
  const [decomposing, setDecomposing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { execState, subTasks, currentSubTaskId, currentPhase, start, pause, resume } =
    useTaskExecution(task?.id ?? "", initialSubTasks ?? []);

  const handleDecompose = async () => {
    if (!goal.trim()) return;
    setDecomposing(true);
    try {
      const res = await fetch("/api/tasks/decompose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal }),
      });
      if (!res.ok) throw new Error("Decomposition failed");
      const data = await res.json() as { task: Task };
      navigate(`/tasks/${data.task.id}`);
    } finally {
      setDecomposing(false);
    }
  };

  const completedCount = subTasks.filter((s) => s.status === "done").length;
  const progress = subTasks.length > 0 ? (completedCount / subTasks.length) * 100 : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 h-12 px-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <CheckSquare className="h-4 w-4 text-indigo-500" />
        <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Tasks</h1>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          {!task && (
            /* Goal input */
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                What do you want to accomplish?
              </label>
              <Textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Describe your goal in detail…"
                rows={4}
                disabled={decomposing}
              />
              <Button
                variant="primary"
                onClick={handleDecompose}
                loading={decomposing}
                disabled={!goal.trim()}
                className="self-end"
              >
                Decompose goal
              </Button>
            </div>
          )}

          {task && (
            <>
              {/* Task goal */}
              <div>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Goal</p>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">{task.goal}</p>
              </div>

              {/* Progress bar */}
              {subTasks.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>{completedCount} / {subTasks.length} complete</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex gap-2">
                {execState === "idle" && (
                  <Button variant="primary" onClick={start} className="gap-2">
                    <Play className="h-3.5 w-3.5" />
                    Start execution
                  </Button>
                )}
                {execState === "running" && (
                  <Button variant="secondary" onClick={pause} className="gap-2">
                    <Pause className="h-3.5 w-3.5" />
                    Pause
                  </Button>
                )}
                {execState === "paused" && (
                  <Button variant="primary" onClick={resume} className="gap-2">
                    <Play className="h-3.5 w-3.5" />
                    Resume
                  </Button>
                )}
                {execState === "completed" && (
                  <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                    ✓ All tasks completed
                  </div>
                )}
              </div>

              {/* Sub-task list */}
              <div className="flex flex-col gap-2">
                {subTasks.map((st, i) => (
                  <div
                    key={st.id}
                    className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedId((id) => id === st.id ? null : st.id)}
                      className={cn(
                        "flex items-center gap-3 w-full px-4 py-3 text-left",
                        "hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors",
                        currentSubTaskId === st.id && "bg-indigo-50 dark:bg-indigo-950",
                      )}
                    >
                      <span className="text-xs text-zinc-400 w-4">{i + 1}</span>
                      <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                        {st.title}
                        {currentSubTaskId === st.id && currentPhase && (
                          <span className="ml-2 text-xs text-indigo-500 font-normal animate-pulse">
                            {currentPhase}…
                          </span>
                        )}
                      </span>
                      <TaskStateIndicator status={st.status} />
                      {expandedId === st.id ? (
                        <ChevronDown className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      )}
                    </button>

                    {expandedId === st.id && (
                      <div className="border-t border-zinc-200 dark:border-zinc-700 p-4 flex flex-col gap-3 text-sm">
                        <p className="text-zinc-600 dark:text-zinc-400">{st.description}</p>
                        {st.executeOutput && (
                          <div>
                            <p className="text-xs font-medium text-zinc-500 mb-1">Output</p>
                            <pre className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed bg-zinc-50 dark:bg-zinc-900 rounded-md p-3">
                              {st.executeOutput}
                            </pre>
                          </div>
                        )}
                        {st.errorMessage && (
                          <p className="text-xs text-red-500">{st.errorMessage}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
