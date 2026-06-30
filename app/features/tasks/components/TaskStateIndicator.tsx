import { Circle, Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Badge } from "~/shared/components/ui/Badge";
import type { SubTask } from "~/shared/lib/db/schema";

type Status = SubTask["status"];

const CONFIG: Record<Status, { icon: typeof Circle; label: string; variant: "default" | "success" | "warning" | "error" | "info" }> = {
  todo: { icon: Circle, label: "Todo", variant: "default" },
  doing: { icon: Loader2, label: "Running", variant: "info" },
  done: { icon: CheckCircle2, label: "Done", variant: "success" },
  failed: { icon: XCircle, label: "Failed", variant: "error" },
  retry: { icon: RefreshCw, label: "Retry", variant: "warning" },
};

interface TaskStateIndicatorProps {
  status: Status;
}

export function TaskStateIndicator({ status }: TaskStateIndicatorProps) {
  const { icon: Icon, label, variant } = CONFIG[status];
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
