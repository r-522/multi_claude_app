import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as RadixTooltip from "@radix-ui/react-tooltip";
import { cn } from "~/shared/lib/utils";
export function Tooltip({ content, children, side = "top", className }) {
    return (_jsx(RadixTooltip.Provider, { delayDuration: 400, children: _jsxs(RadixTooltip.Root, { children: [_jsx(RadixTooltip.Trigger, { asChild: true, children: children }), _jsx(RadixTooltip.Portal, { children: _jsxs(RadixTooltip.Content, { side: side, sideOffset: 6, className: cn("z-50 px-2.5 py-1 rounded-md text-xs font-medium", "bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900", "shadow-md select-none", className), children: [content, _jsx(RadixTooltip.Arrow, { className: "fill-zinc-900 dark:fill-zinc-100" })] }) })] }) }));
}
