import * as RadixTooltip from "@radix-ui/react-tooltip";
import { cn } from "~/shared/lib/utils";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

export function Tooltip({ content, children, side = "top", className }: TooltipProps) {
  return (
    <RadixTooltip.Provider delayDuration={400}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side={side}
            sideOffset={6}
            className={cn(
              "z-50 px-2.5 py-1 rounded-md text-xs font-medium",
              "bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900",
              "shadow-md select-none",
              className,
            )}
          >
            {content}
            <RadixTooltip.Arrow className="fill-zinc-900 dark:fill-zinc-100" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
