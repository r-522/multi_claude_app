import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "~/shared/lib/utils";
export function Skeleton({ className }) {
    return (_jsx("div", { className: cn("animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800", className) }));
}
