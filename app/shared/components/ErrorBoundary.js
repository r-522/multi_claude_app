import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRouteError, isRouteErrorResponse, Link } from "@remix-run/react";
import { AlertTriangle } from "lucide-react";
import { Button } from "~/shared/components/ui/Button";
export function GeneralErrorBoundary() {
    const error = useRouteError();
    let heading = "Something went wrong";
    let message = "An unexpected error occurred. Please try again.";
    let status;
    if (isRouteErrorResponse(error)) {
        status = error.status;
        if (error.status === 404) {
            heading = "Page not found";
            message = "The page you're looking for doesn't exist.";
        }
        else if (error.status === 429) {
            heading = "Too many requests";
            message = "You've hit the rate limit. Please wait a moment before trying again.";
        }
        else if (error.status === 503) {
            heading = "Service unavailable";
            message = "Claude is temporarily unavailable. Please try again in a moment.";
        }
    }
    else if (error instanceof Error) {
        message = error.message;
    }
    return (_jsxs("div", { className: "flex flex-col items-center justify-center min-h-[50vh] gap-4 p-8 text-center", children: [_jsx("div", { className: "flex items-center justify-center h-12 w-12 rounded-full bg-red-50 dark:bg-red-950", children: _jsx(AlertTriangle, { className: "h-6 w-6 text-red-500" }) }), status && (_jsx("p", { className: "text-4xl font-bold text-zinc-200 dark:text-zinc-800", children: status })), _jsxs("div", { children: [_jsx("h1", { className: "text-lg font-semibold text-zinc-900 dark:text-zinc-100", children: heading }), _jsx("p", { className: "mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm", children: message })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "secondary", onClick: () => window.location.reload(), children: "Try again" }), _jsx(Link, { to: "/", className: "inline-flex items-center justify-center h-8 px-3 text-sm font-medium rounded-md border border-transparent bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800", children: "Go home" })] })] }));
}
