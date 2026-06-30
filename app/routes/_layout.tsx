import { Outlet, redirect } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Sidebar } from "~/shared/components/layout/Sidebar";
import { GeneralErrorBoundary } from "~/shared/components/ErrorBoundary";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  if (url.pathname === "/" || url.pathname === "") {
    throw redirect("/chat");
  }
  return null;
}

export default function AppLayout() {
  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}

export { GeneralErrorBoundary as ErrorBoundary };
