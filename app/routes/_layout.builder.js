import { jsx as _jsx } from "react/jsx-runtime";
import { BuilderPanel } from "~/features/builder/components/BuilderPanel";
import { GeneralErrorBoundary } from "~/shared/components/ErrorBoundary";
export default function BuilderRoute() {
    return _jsx(BuilderPanel, {});
}
export { GeneralErrorBoundary as ErrorBoundary };
