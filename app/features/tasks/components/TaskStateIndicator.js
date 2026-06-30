import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Circle, Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Badge } from "~/shared/components/ui/Badge";
const CONFIG = {
    todo: { icon: Circle, label: "Todo", variant: "default" },
    doing: { icon: Loader2, label: "Running", variant: "info" },
    done: { icon: CheckCircle2, label: "Done", variant: "success" },
    failed: { icon: XCircle, label: "Failed", variant: "error" },
    retry: { icon: RefreshCw, label: "Retry", variant: "warning" },
};
export function TaskStateIndicator({ status }) {
    const { icon: Icon, label, variant } = CONFIG[status];
    return (_jsxs(Badge, { variant: variant, className: "gap-1", children: [_jsx(Icon, { className: "h-3 w-3" }), label] }));
}
