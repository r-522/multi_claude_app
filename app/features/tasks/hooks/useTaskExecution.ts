import { useState, useCallback, useRef } from "react";
import type { SubTask } from "~/shared/lib/db/schema";
import type { ReviewVerdict } from "~/features/tasks/schemas/tasks.schema";

type ExecState = "idle" | "running" | "paused" | "completed" | "failed";

export interface TaskExecutionState {
  state: ExecState;
  currentSubTaskId: string | null;
  currentPhase: "plan" | "execute" | "review" | "improve" | null;
  subTasks: SubTask[];
}

export function useTaskExecution(taskId: string, initialSubTasks: SubTask[]) {
  const [execState, setExecState] = useState<ExecState>("idle");
  const [subTasks, setSubTasks] = useState<SubTask[]>(initialSubTasks);
  const [currentSubTaskId, setCurrentSubTaskId] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState<"plan" | "execute" | "review" | "improve" | null>(null);
  const pauseRef = useRef(false);

  const callPhase = useCallback(
    async (
      subTaskId: string,
      phase: "plan" | "execute" | "review" | "improve",
      ctx?: Record<string, string>,
    ): Promise<string> => {
      setCurrentPhase(phase);
      const res = await fetch(`/api/tasks/${taskId}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subTaskId, phase, context: ctx }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Phase failed" }));
        throw new Error((err as { message?: string }).message ?? "Phase failed");
      }
      const data = await res.json() as { output: string };
      return data.output;
    },
    [taskId],
  );

  const updateSubTaskStatus = useCallback(
    (id: string, updates: Partial<SubTask>) => {
      setSubTasks((prev) => prev.map((st) => (st.id === id ? { ...st, ...updates } : st)));
    },
    [],
  );

  const start = useCallback(async () => {
    setExecState("running");
    pauseRef.current = false;

    for (const subTask of subTasks) {
      if (subTask.status === "done") continue;
      if (pauseRef.current) { setExecState("paused"); return; }

      setCurrentSubTaskId(subTask.id);
      updateSubTaskStatus(subTask.id, { status: "doing" });

      let retryCount = subTask.retryCount;
      let executeOutput = subTask.executeOutput ?? "";

      try {
        // Plan phase
        const plan = await callPhase(subTask.id, "plan");
        updateSubTaskStatus(subTask.id, { planOutput: plan });

        // Execute → Review → Improve loop
        while (true) {
          if (pauseRef.current) { setExecState("paused"); return; }

          executeOutput = await callPhase(subTask.id, "execute", { plan });
          updateSubTaskStatus(subTask.id, { executeOutput });

          const reviewRaw = await callPhase(subTask.id, "review", { plan, execute: executeOutput });
          const review = JSON.parse(reviewRaw) as ReviewVerdict;

          if (review.verdict === "pass") {
            updateSubTaskStatus(subTask.id, { status: "done", reviewOutput: reviewRaw });
            break;
          }

          if (retryCount >= (subTask.maxRetries ?? 2)) {
            updateSubTaskStatus(subTask.id, { status: "failed", errorMessage: review.reason });
            break;
          }

          retryCount++;
          updateSubTaskStatus(subTask.id, { status: "retry", retryCount, reviewOutput: reviewRaw });
          executeOutput = await callPhase(subTask.id, "improve", { reason: review.reason });
          updateSubTaskStatus(subTask.id, { status: "doing", improveOutput: executeOutput });
        }
      } catch (err) {
        updateSubTaskStatus(subTask.id, {
          status: "failed",
          errorMessage: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    setCurrentSubTaskId(null);
    setCurrentPhase(null);
    setExecState("completed");
  }, [subTasks, callPhase, updateSubTaskStatus]);

  const pause = useCallback(() => {
    pauseRef.current = true;
    setExecState("paused");
  }, []);

  const resume = useCallback(() => {
    pauseRef.current = false;
    start();
  }, [start]);

  return {
    execState,
    subTasks,
    currentSubTaskId,
    currentPhase,
    start,
    pause,
    resume,
  };
}
