import { BuilderPanel } from "~/features/builder/components/BuilderPanel";
import { GeneralErrorBoundary } from "~/shared/components/ErrorBoundary";

export default function BuilderRoute() {
  return <BuilderPanel />;
}

export { GeneralErrorBoundary as ErrorBoundary };
