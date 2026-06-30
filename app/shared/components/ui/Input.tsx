import { forwardRef } from "react";
import { cn } from "~/shared/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <input
          ref={ref}
          className={cn(
            "h-8 w-full rounded-md border px-3 text-sm",
            "bg-white dark:bg-zinc-900",
            "border-zinc-200 dark:border-zinc-700",
            "text-zinc-900 dark:text-zinc-100",
            "placeholder:text-zinc-400 dark:placeholder:text-zinc-600",
            "focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-red-400 focus:ring-red-400 focus:border-red-400",
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
