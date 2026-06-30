import { useCallback, useRef } from "react";
export function useStream() {
    const abortRef = useRef(null);
    const start = useCallback(async (url, body, handlers) => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: controller.signal,
        });
        if (!response.ok || !response.body) {
            const err = await response.json().catch(() => ({ message: "Stream failed" }));
            handlers.onError({
                type: "error",
                code: "STREAM_ERROR",
                message: err.message ?? "Stream failed",
                retryable: true,
            });
            return;
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                const parts = buffer.split("\n\n");
                buffer = parts.pop() ?? "";
                for (const part of parts) {
                    const line = part.trim();
                    if (!line.startsWith("data: "))
                        continue;
                    const chunk = JSON.parse(line.slice(6));
                    if (chunk.type === "delta")
                        handlers.onDelta(chunk.content);
                    else if (chunk.type === "thinking")
                        handlers.onThinking(chunk.thinking);
                    else if (chunk.type === "done")
                        handlers.onDone(chunk);
                    else if (chunk.type === "error")
                        handlers.onError(chunk);
                }
            }
        }
        catch (err) {
            if (err.name !== "AbortError") {
                handlers.onError({ type: "error", code: "NETWORK_ERROR", message: "Connection lost", retryable: true });
            }
        }
        finally {
            reader.releaseLock();
        }
    }, []);
    const stop = useCallback(() => {
        abortRef.current?.abort();
    }, []);
    return { start, stop };
}
