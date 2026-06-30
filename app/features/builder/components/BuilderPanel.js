import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Textarea } from "~/shared/components/ui/Textarea";
import { Button } from "~/shared/components/ui/Button";
import { Skeleton } from "~/shared/components/ui/Skeleton";
import { Badge } from "~/shared/components/ui/Badge";
import { Copy, Check, Sparkles } from "lucide-react";
import { cn } from "~/shared/lib/utils";
const LEVELS = [
    { key: "simple", label: "Simple", description: "Direct, minimal" },
    { key: "standard", label: "Standard", description: "Clear structure" },
    { key: "professional", label: "Professional", description: "Production-ready" },
    { key: "research", label: "Research", description: "Academic rigor" },
];
export function BuilderPanel() {
    const [rawInput, setRawInput] = useState("");
    const [phase, setPhase] = useState("idle");
    const [analysis, setAnalysis] = useState(null);
    const [builtPrompt, setBuiltPrompt] = useState(null);
    const [activeLevel, setActiveLevel] = useState("standard");
    const [error, setError] = useState(null);
    const [copiedLevel, setCopiedLevel] = useState(null);
    const analyze = async () => {
        if (!rawInput.trim())
            return;
        setPhase("analyzing");
        setError(null);
        try {
            const res = await fetch("/api/builder/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rawInput }),
            });
            if (!res.ok)
                throw new Error("Analysis failed");
            const data = await res.json();
            setAnalysis(data.analysis);
            setPhase("generating");
            await generate(data.analysis);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
            setPhase("error");
        }
    };
    const generate = async (a) => {
        try {
            const res = await fetch("/api/builder/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rawInput, analysis: a }),
            });
            if (!res.ok)
                throw new Error("Generation failed");
            const data = await res.json();
            setBuiltPrompt(data.builtPrompt);
            setPhase("done");
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
            setPhase("error");
        }
    };
    const copy = async (level) => {
        if (!builtPrompt)
            return;
        await navigator.clipboard.writeText(builtPrompt[level]);
        setCopiedLevel(level);
        setTimeout(() => setCopiedLevel(null), 2000);
    };
    const isLoading = phase === "analyzing" || phase === "generating";
    return (_jsxs("div", { className: "flex flex-col h-full", children: [_jsxs("div", { className: "flex items-center gap-2 h-12 px-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0", children: [_jsx(Sparkles, { className: "h-4 w-4 text-indigo-500" }), _jsx("h1", { className: "text-sm font-semibold text-zinc-900 dark:text-zinc-100", children: "Prompt Builder" })] }), _jsx("div", { className: "flex-1 overflow-auto p-6", children: _jsxs("div", { className: "max-w-3xl mx-auto flex flex-col gap-6", children: [_jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("label", { className: "text-sm font-medium text-zinc-700 dark:text-zinc-300", children: "Raw prompt" }), _jsx(Textarea, { value: rawInput, onChange: (e) => setRawInput(e.target.value), placeholder: "Paste your rough prompt here\u2026", rows: 5, disabled: isLoading, className: "min-h-[120px]" }), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { variant: "primary", onClick: analyze, loading: isLoading, disabled: !rawInput.trim() || isLoading, children: phase === "analyzing" ? "Analyzing…" : phase === "generating" ? "Generating…" : "Build prompt" }) })] }), (phase === "analyzing" || analysis) && (_jsxs("div", { className: "flex flex-col gap-3", children: [_jsx("h2", { className: "text-sm font-medium text-zinc-700 dark:text-zinc-300", children: "Analysis" }), phase === "analyzing" || !analysis ? (_jsxs("div", { className: "flex flex-col gap-2", children: [_jsx(Skeleton, { className: "h-4 w-3/4" }), _jsx(Skeleton, { className: "h-4 w-1/2" }), _jsx(Skeleton, { className: "h-4 w-2/3" })] })) : (_jsxs("div", { className: "rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 flex flex-col gap-3 text-sm", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1", children: "Purpose" }), _jsx("p", { className: "text-zinc-700 dark:text-zinc-300", children: analysis.purpose })] }), analysis.missingInfo.length > 0 && (_jsxs("div", { children: [_jsx("p", { className: "text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5", children: "Missing information" }), _jsx("div", { className: "flex flex-wrap gap-1.5", children: analysis.missingInfo.map((info, i) => (_jsx(Badge, { variant: "warning", children: info }, i))) })] })), analysis.improvements.length > 0 && (_jsxs("div", { children: [_jsx("p", { className: "text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5", children: "Improvements" }), _jsx("ul", { className: "flex flex-col gap-1", children: analysis.improvements.map((imp, i) => (_jsxs("li", { className: "text-zinc-600 dark:text-zinc-400", children: ["\u2022 ", imp] }, i))) })] }))] }))] })), (phase === "generating" || phase === "done") && (_jsxs("div", { className: "flex flex-col gap-3", children: [_jsx("h2", { className: "text-sm font-medium text-zinc-700 dark:text-zinc-300", children: "Generated prompts" }), _jsx("div", { className: "flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg", children: LEVELS.map((l) => (_jsx("button", { onClick: () => setActiveLevel(l.key), className: cn("flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-colors", activeLevel === l.key
                                            ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                                            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"), children: l.label }, l.key))) }), phase === "generating" || !builtPrompt ? (_jsx(Skeleton, { className: "h-40" })) : (_jsxs("div", { className: "relative rounded-lg border border-zinc-200 dark:border-zinc-700 p-4", children: [_jsx("pre", { className: "text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed", children: builtPrompt[activeLevel] }), _jsx(Button, { variant: "ghost", size: "icon", onClick: () => copy(activeLevel), className: "absolute top-2 right-2", children: copiedLevel === activeLevel ? _jsx(Check, { className: "h-3.5 w-3.5" }) : _jsx(Copy, { className: "h-3.5 w-3.5" }) })] })), builtPrompt?.reasoning && (_jsxs("details", { className: "text-sm", children: [_jsx("summary", { className: "cursor-pointer text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300", children: "View improvement reasoning" }), _jsx("p", { className: "mt-2 text-zinc-600 dark:text-zinc-400 leading-relaxed", children: builtPrompt.reasoning })] }))] })), error && (_jsx("div", { className: "rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-4 text-sm text-red-600 dark:text-red-400", children: error }))] }) })] }));
}
