import { CARD_COLORS } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
}

const colorSwatches: Record<string, string> = {
  default: "bg-card border-border",
  blue: "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700",
  green: "bg-emerald-100 dark:bg-emerald-900 border-emerald-300 dark:border-emerald-700",
  purple: "bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700",
  orange: "bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-700",
  pink: "bg-pink-100 dark:bg-pink-900 border-pink-300 dark:border-pink-700",
  cyan: "bg-cyan-100 dark:bg-cyan-900 border-cyan-300 dark:border-cyan-700",
  yellow: "bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700",
  red: "bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700",
};

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CARD_COLORS.map((color) => (
        <button
          key={color.id}
          type="button"
          onClick={() => onChange(color.id)}
          className={cn(
            "h-8 w-8 rounded-md border-2 transition-all flex items-center justify-center",
            colorSwatches[color.id],
            value === color.id && "ring-2 ring-primary ring-offset-2 ring-offset-background"
          )}
          title={color.name}
          data-testid={`color-option-${color.id}`}
        >
          {value === color.id && (
            <Check className="h-4 w-4 text-foreground" />
          )}
        </button>
      ))}
    </div>
  );
}
