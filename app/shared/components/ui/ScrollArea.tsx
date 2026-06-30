import * as RadixScrollArea from "@radix-ui/react-scroll-area";
import { cn } from "~/shared/lib/utils";

interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  viewportRef?: React.RefObject<HTMLDivElement>;
}

export function ScrollArea({ children, className, viewportRef }: ScrollAreaProps) {
  return (
    <RadixScrollArea.Root className={cn("overflow-hidden", className)}>
      <RadixScrollArea.Viewport ref={viewportRef} className="h-full w-full">
        {children}
      </RadixScrollArea.Viewport>
      <RadixScrollArea.Scrollbar
        orientation="vertical"
        className="flex select-none touch-none p-0.5 w-2.5"
      >
        <RadixScrollArea.Thumb className="flex-1 bg-zinc-200 dark:bg-zinc-700 rounded-full relative before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
      </RadixScrollArea.Scrollbar>
    </RadixScrollArea.Root>
  );
}
