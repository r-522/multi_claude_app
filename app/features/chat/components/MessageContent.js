import { jsx as _jsx } from "react/jsx-runtime";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "~/shared/lib/utils";
export function MessageContent({ content, className }) {
    return (_jsx("div", { className: cn("prose text-sm", className), children: _jsx(ReactMarkdown, { remarkPlugins: [remarkGfm], components: {
                pre: ({ children }) => (_jsx("pre", { className: "bg-zinc-950 dark:bg-zinc-900 text-zinc-100 p-4 rounded-lg overflow-x-auto text-xs leading-relaxed", children: children })),
                code: ({ className: cls, children, ...props }) => {
                    const isInline = !cls;
                    if (isInline) {
                        return (_jsx("code", { className: "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-1.5 py-0.5 rounded text-[0.8em] font-mono", ...props, children: children }));
                    }
                    return (_jsx("code", { className: cn("font-mono", cls), ...props, children: children }));
                },
            }, children: content }) }));
}
