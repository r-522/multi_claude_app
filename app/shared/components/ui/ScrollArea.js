import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as RadixScrollArea from "@radix-ui/react-scroll-area";
import { cn } from "~/shared/lib/utils";
export function ScrollArea({ children, className, viewportRef }) {
    return (_jsxs(RadixScrollArea.Root, { className: cn("overflow-hidden", className), children: [_jsx(RadixScrollArea.Viewport, { ref: viewportRef, className: "h-full w-full", children: children }), _jsx(RadixScrollArea.Scrollbar, { orientation: "vertical", className: "flex select-none touch-none p-0.5 w-2.5", children: _jsx(RadixScrollArea.Thumb, { className: "flex-1 bg-zinc-200 dark:bg-zinc-700 rounded-full relative before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" }) })] }));
}
