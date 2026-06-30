import { useState } from "react";
import { Textarea } from "~/shared/components/ui/Textarea";
import { Button } from "~/shared/components/ui/Button";
import { Skeleton } from "~/shared/components/ui/Skeleton";
import { Badge } from "~/shared/components/ui/Badge";
import { Copy, Check, Sparkles } from "lucide-react";
import type { PromptAnalysis, BuiltPrompt } from "~/features/builder/schemas/builder.schema";
import { cn } from "~/shared/lib/utils";

type Phase = "idle" | "analyzing" | "generating" | "done" | "error";
type Level = "simple" | "standard" | "professional" | "research";

const LEVELS: { key: Level; label: string; description: string }[] = [
  { key: "simple", label: "Simple", description: "Direct, minimal" },
  { key: "standard", label: "Standard", description: "Clear structure" },
  { key: "professional", label: "Professional", description: "Production-ready" },
  { key: "research", label: "Research", description: "Academic rigor" },
];

export function BuilderPanel() {
  const [rawInput, setRawInput] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [builtPrompt, setBuiltPrompt] = useState<BuiltPrompt | null>(null);
  const [activeLevel, setActiveLevel] = useState<Level>("standard");
  const [error, setError] = useState<string | null>(null);
  const [copiedLevel, setCopiedLevel] = useState<Level | null>(null);

  const analyze = async () => {
    if (!rawInput.trim()) return;
    setPhase("analyzing");
    setError(null);
    try {
      const res = await fetch("/api/builder/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawInput }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json() as { analysis: PromptAnalysis };
      setAnalysis(data.analysis);
      setPhase("generating");
      await generate(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPhase("error");
    }
  };

  const generate = async (a: PromptAnalysis) => {
    try {
      const res = await fetch("/api/builder/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawInput, analysis: a }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json() as { builtPrompt: BuiltPrompt };
      setBuiltPrompt(data.builtPrompt);
      setPhase("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPhase("error");
    }
  };

  const copy = async (level: Level) => {
    if (!builtPrompt) return;
    await navigator.clipboard.writeText(builtPrompt[level]);
    setCopiedLevel(level);
    setTimeout(() => setCopiedLevel(null), 2000);
  };

  const isLoading = phase === "analyzing" || phase === "generating";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 h-12 px-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <Sparkles className="h-4 w-4 text-indigo-500" />
        <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Prompt Builder</h1>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          {/* Input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Raw prompt
            </label>
            <Textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="Paste your rough prompt here…"
              rows={5}
              disabled={isLoading}
              className="min-h-[120px]"
            />
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={analyze}
                loading={isLoading}
                disabled={!rawInput.trim() || isLoading}
              >
                {phase === "analyzing" ? "Analyzing…" : phase === "generating" ? "Generating…" : "Build prompt"}
              </Button>
            </div>
          </div>

          {/* Analysis results */}
          {(phase === "analyzing" || analysis) && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Analysis</h2>
              {phase === "analyzing" || !analysis ? (
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : (
                <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 flex flex-col gap-3 text-sm">
                  <div>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Purpose</p>
                    <p className="text-zinc-700 dark:text-zinc-300">{analysis.purpose}</p>
                  </div>
                  {analysis.missingInfo.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Missing information</p>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.missingInfo.map((info, i) => (
                          <Badge key={i} variant="warning">{info}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysis.improvements.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Improvements</p>
                      <ul className="flex flex-col gap-1">
                        {analysis.improvements.map((imp, i) => (
                          <li key={i} className="text-zinc-600 dark:text-zinc-400">• {imp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Generated prompts */}
          {(phase === "generating" || phase === "done") && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Generated prompts</h2>

              {/* Level tabs */}
              <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                {LEVELS.map((l) => (
                  <button
                    key={l.key}
                    onClick={() => setActiveLevel(l.key)}
                    className={cn(
                      "flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-colors",
                      activeLevel === l.key
                        ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300",
                    )}
                  >
                    {l.label}
                  </button>
                ))}
              </div>

              {/* Output */}
              {phase === "generating" || !builtPrompt ? (
                <Skeleton className="h-40" />
              ) : (
                <div className="relative rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
                  <pre className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed">
                    {builtPrompt[activeLevel]}
                  </pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copy(activeLevel)}
                    className="absolute top-2 right-2"
                  >
                    {copiedLevel === activeLevel ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              )}

              {/* Reasoning */}
              {builtPrompt?.reasoning && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300">
                    View improvement reasoning
                  </summary>
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400 leading-relaxed">{builtPrompt.reasoning}</p>
                </details>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-4 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
