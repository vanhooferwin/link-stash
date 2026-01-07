import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { HttpMethod } from "@shared/schema";

interface MethodBadgeProps {
  method: HttpMethod;
  className?: string;
}

const methodColors: Record<HttpMethod, string> = {
  GET: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  POST: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  PUT: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  PATCH: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

export function MethodBadge({ method, className }: MethodBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-mono text-xs font-semibold no-default-hover-elevate no-default-active-elevate",
        methodColors[method],
        className
      )}
      data-testid={`method-badge-${method.toLowerCase()}`}
    >
      {method}
    </Badge>
  );
}
