import { cn } from "@/lib/utils";

interface HealthIndicatorProps {
  status: "online" | "offline" | "unknown";
  className?: string;
  showLabel?: boolean;
}

export function HealthIndicator({ status, className, showLabel = false }: HealthIndicatorProps) {
  const statusConfig = {
    online: {
      color: "bg-emerald-500",
      label: "Online",
      pulse: false,
    },
    offline: {
      color: "bg-red-500",
      label: "Offline",
      pulse: true,
    },
    unknown: {
      color: "bg-gray-400 dark:bg-gray-600",
      label: "Unknown",
      pulse: false,
    },
  };

  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "h-3 w-3 rounded-full",
          config.color,
          config.pulse && "animate-pulse"
        )}
        data-testid={`health-indicator-${status}`}
        aria-label={config.label}
      />
      {showLabel && (
        <span className="text-xs text-muted-foreground">{config.label}</span>
      )}
    </div>
  );
}
