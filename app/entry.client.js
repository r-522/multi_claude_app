import { jsx as _jsx } from "react/jsx-runtime";
import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
startTransition(() => {
    hydrateRoot(document, _jsx(StrictMode, { children: _jsx(RemixBrowser, {}) }));
});
