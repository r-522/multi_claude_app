import { Select } from "~/shared/components/ui/Select";
import { MODEL_REGISTRY } from "~/shared/lib/claude/models";
import { MODEL_IDS } from "~/shared/types/claude";
import type { ModelId, EffortLevel } from "~/shared/types/claude";

const EFFORT_OPTIONS: { value: EffortLevel; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "xhigh", label: "X-High" },
  { value: "max", label: "Max" },
];

interface ModelSelectorProps {
  model: ModelId;
  effort: EffortLevel;
  temperature: number | null;
  onModelChange: (model: ModelId) => void;
  onEffortChange: (effort: EffortLevel) => void;
  onTemperatureChange: (temp: number) => void;
}

export function ModelSelector({
  model,
  effort,
  temperature,
  onModelChange,
  onEffortChange,
  onTemperatureChange,
}: ModelSelectorProps) {
  const config = MODEL_REGISTRY[model];
  const modelOptions = MODEL_IDS.map((id) => ({
    value: id,
    label: MODEL_REGISTRY[id].displayName,
  }));

  const effortOptions = EFFORT_OPTIONS.filter((o) => {
    if (!config.supportsEffort) return false;
    if (o.value === "xhigh" && !config.supportsXHighEffort) return false;
    return true;
  });

  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <Select
        value={model}
        onValueChange={(v) => onModelChange(v as ModelId)}
        options={modelOptions}
        className="w-36"
      />

      {config.supportsEffort && (
        <Select
          value={effort}
          onValueChange={(v) => onEffortChange(v as EffortLevel)}
          options={effortOptions}
          className="w-24"
        />
      )}

      {config.supportsTemperature && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 whitespace-nowrap">Temp</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={temperature ?? 0.7}
            onChange={(e) => onTemperatureChange(Number(e.target.value))}
            className="w-24 accent-indigo-500"
          />
          <span className="text-xs text-zinc-400 w-6">{(temperature ?? 0.7).toFixed(1)}</span>
        </div>
      )}
    </div>
  );
}
