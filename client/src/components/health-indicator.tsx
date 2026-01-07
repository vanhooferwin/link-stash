import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HealthIndicatorProps {
  status: "online" | "offline" | "unknown";
  className?: string;
  showLabel?: boolean;
  isAnimating?: boolean;
  tooltipMessage?: string;
}

export function HealthIndicator({ 
  status, 
  className, 
  showLabel = false, 
  isAnimating = false,
  tooltipMessage 
}: HealthIndicatorProps) {
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

  const indicator = (
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

  // If there's a tooltip message (non-green status), wrap in tooltip
  if (tooltipMessage) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            {indicator}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {tooltipMessage}
        </TooltipContent>
      </Tooltip>
    );
  }

  return indicator;
}
