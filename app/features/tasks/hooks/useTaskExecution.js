import { useState, useCallback, useRef } from "react";
export function useTaskExecution(taskId, initialSubTasks) {
    const [execState, setExecState] = useState("idle");
    const [subTasks, setSubTasks] = useState(initialSubTasks);
    const [currentSubTaskId, setCurrentSubTaskId] = useState(null);
    const [currentPhase, setCurrentPhase] = useState(null);
    const pauseRef = useRef(false);
    const callPhase = useCallback(async (subTaskId, phase, ctx) => {
        setCurrentPhase(phase);
        const res = await fetch(`/api/tasks/${taskId}/execute`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subTaskId, phase, context: ctx }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ message: "Phase failed" }));
            throw new Error(err.message ?? "Phase failed");
        }
        const data = await res.json();
        return data.output;
    }, [taskId]);
    const updateSubTaskStatus = useCallback((id, updates) => {
        setSubTasks((prev) => prev.map((st) => (st.id === id ? { ...st, ...updates } : st)));
    }, []);
    const start = useCallback(async () => {
        setExecState("running");
        pauseRef.current = false;
        for (const subTask of subTasks) {
            if (subTask.status === "done")
                continue;
            if (pauseRef.current) {
                setExecState("paused");
                return;
            }
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
                    if (pauseRef.current) {
                        setExecState("paused");
                        return;
                    }
                    executeOutput = await callPhase(subTask.id, "execute", { plan });
                    updateSubTaskStatus(subTask.id, { executeOutput });
                    const reviewRaw = await callPhase(subTask.id, "review", { plan, execute: executeOutput });
                    const review = JSON.parse(reviewRaw);
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
            }
            catch (err) {
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
