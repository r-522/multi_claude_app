import * as RadixSelect from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "~/shared/lib/utils";

interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({ value, onValueChange, options, placeholder, disabled, className }: SelectProps) {
  const selected = options.find((o) => o.value === value);

  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <RadixSelect.Trigger
        className={cn(
          "inline-flex items-center justify-between gap-2 h-8 px-3 text-sm rounded-md border",
          "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700",
          "text-zinc-900 dark:text-zinc-100",
          "hover:bg-zinc-50 dark:hover:bg-zinc-800",
          "focus:outline-none focus:ring-1 focus:ring-indigo-500",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        )}
      >
        <RadixSelect.Value placeholder={placeholder}>
          {selected?.label ?? placeholder}
        </RadixSelect.Value>
        <ChevronDown className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          className={cn(
            "z-50 min-w-[160px] overflow-hidden rounded-lg border shadow-lg",
            "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700",
          )}
          position="popper"
          sideOffset={4}
        >
          <RadixSelect.Viewport className="p-1">
            {options.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className={cn(
                  "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm cursor-default",
                  "text-zinc-700 dark:text-zinc-300",
                  "data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-800",
                  "data-[highlighted]:text-zinc-900 dark:data-[highlighted]:text-zinc-100",
                  "data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed",
                  "focus:outline-none",
                )}
              >
                <div className="flex-1">
                  <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                  {option.description && (
                    <p className="text-xs text-zinc-400 mt-0.5">{option.description}</p>
                  )}
                </div>
                <RadixSelect.ItemIndicator>
                  <Check className="h-3.5 w-3.5 text-indigo-500" />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
