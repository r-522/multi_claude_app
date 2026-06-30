import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse, useRouteError, } from "@remix-run/react";
import stylesheet from "~/styles/globals.css?url";
export const links = () => [
    { rel: "stylesheet", href: stylesheet },
    { rel: "preconnect", href: "/" },
];
export function Layout({ children }) {
    return (_jsxs("html", { lang: "en", suppressHydrationWarning: true, children: [_jsxs("head", { children: [_jsx("meta", { charSet: "utf-8" }), _jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }), _jsx(Meta, {}), _jsx(Links, {}), _jsx("script", { dangerouslySetInnerHTML: {
                            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('theme');
                  if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
                        } })] }), _jsxs("body", { className: "bg-[var(--bg)] text-[var(--text)]", children: [children, _jsx(ScrollRestoration, {}), _jsx(Scripts, {})] })] }));
}
export default function App() {
    return _jsx(Outlet, {});
}
export function ErrorBoundary() {
    const error = useRouteError();
    let message = "An unexpected error occurred.";
    let status = 500;
    if (isRouteErrorResponse(error)) {
        status = error.status;
        message = error.statusText || message;
    }
    else if (error instanceof Error) {
        message = error.message;
    }
    return (_jsxs("html", { lang: "en", children: [_jsxs("head", { children: [_jsxs("title", { children: [status, " \u2014 Error"] }), _jsx(Links, {})] }), _jsxs("body", { className: "flex items-center justify-center min-h-dvh bg-white dark:bg-zinc-950", children: [_jsxs("div", { className: "text-center p-8", children: [_jsx("p", { className: "text-6xl font-bold text-zinc-200 dark:text-zinc-800", children: status }), _jsx("p", { className: "mt-2 text-zinc-600 dark:text-zinc-400", children: message })] }), _jsx(Scripts, {})] })] }));
}
