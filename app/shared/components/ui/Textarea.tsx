import { forwardRef, useEffect, useRef } from "react";
import { cn } from "~/shared/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoResize, error, onChange, ...props }, ref) => {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);

    const setRef = (el: HTMLTextAreaElement | null) => {
      innerRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
    };

    const resize = () => {
      const el = innerRef.current;
      if (!el || !autoResize) return;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    };

    useEffect(() => { resize(); });

    return (
      <div className="flex flex-col gap-1">
        <textarea
          ref={setRef}
          onChange={(e) => {
            resize();
            onChange?.(e);
          }}
          className={cn(
            "w-full rounded-md border px-3 py-2 text-sm",
            "bg-white dark:bg-zinc-900",
            "border-zinc-200 dark:border-zinc-700",
            "text-zinc-900 dark:text-zinc-100",
            "placeholder:text-zinc-400 dark:placeholder:text-zinc-600",
            "focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "resize-none",
            error && "border-red-400 focus:ring-red-400",
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
