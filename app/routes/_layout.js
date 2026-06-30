import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet, redirect } from "@remix-run/react";
import { Sidebar } from "~/shared/components/layout/Sidebar";
import { GeneralErrorBoundary } from "~/shared/components/ErrorBoundary";
export async function loader({ request }) {
    const url = new URL(request.url);
    if (url.pathname === "/" || url.pathname === "") {
        throw redirect("/chat");
    }
    return null;
}
export default function AppLayout() {
    return (_jsxs("div", { className: "flex h-dvh overflow-hidden", children: [_jsx(Sidebar, {}), _jsx("main", { className: "flex-1 overflow-hidden", children: _jsx(Outlet, {}) })] }));
}
export { GeneralErrorBoundary as ErrorBoundary };
