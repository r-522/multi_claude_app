import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "~/shared/lib/utils";
const variantClasses = {
    default: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
    success: "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400",
    warning: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
    error: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400",
    info: "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400",
};
export function Badge({ variant = "default", className, children }) {
    return (_jsx("span", { className: cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", variantClasses[variant], className), children: children }));
}
