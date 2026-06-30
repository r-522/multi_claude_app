import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from "react";
import { cn } from "~/shared/lib/utils";
const variantClasses = {
    primary: "bg-indigo-500 dark:bg-indigo-400 text-white hover:bg-indigo-600 dark:hover:bg-indigo-500 border-transparent",
    secondary: "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 border-zinc-200 dark:border-zinc-700",
    ghost: "bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-transparent",
    danger: "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 border-red-200 dark:border-red-800",
};
const sizeClasses = {
    sm: "h-7 px-2.5 text-xs gap-1.5",
    md: "h-8 px-3 text-sm gap-2",
    lg: "h-10 px-4 text-sm gap-2",
    icon: "h-8 w-8 p-0",
};
export const Button = forwardRef(({ className, variant = "secondary", size = "md", loading, disabled, children, ...props }, ref) => {
    return (_jsx("button", { ref: ref, disabled: disabled || loading, className: cn("inline-flex items-center justify-center font-medium rounded-md border transition-colors", "disabled:opacity-50 disabled:cursor-not-allowed", "focus-visible:outline-2 focus-visible:outline-indigo-500", variantClasses[variant], sizeClasses[size], className), ...props, children: loading ? (_jsxs("span", { className: "flex items-center gap-2", children: [_jsx("span", { className: "h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" }), children] })) : (children) }));
});
Button.displayName = "Button";
