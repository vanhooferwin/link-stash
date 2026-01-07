import { cn } from "@/lib/utils";

interface HealthIndicatorProps {
  status: "online" | "offline" | "unknown";
  className?: string;
  showLabel?: boolean;
  isAnimating?: boolean;
}

export function HealthIndicator({ status, className, showLabel = false, isAnimating = false }: HealthIndicatorProps) {
  const statusConfig = {
    online: {
      color: "bg-emerald-500",
      label: "Online",
    },
    offline: {
      color: "bg-red-500",
      label: "Offline",
    },
    unknown: {
      color: "bg-gray-400 dark:bg-gray-600",
      label: "Unknown",
    },
  };

  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "h-3 w-3 rounded-full transition-all",
          config.color,
          isAnimating && "animate-health-blink"
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
