import { CARD_COLORS } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
}

const colorSwatches: Record<string, string> = {
  // Solid colors
  default: "bg-card border-border",
  blue: "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700",
  green: "bg-emerald-100 dark:bg-emerald-900 border-emerald-300 dark:border-emerald-700",
  purple: "bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700",
  orange: "bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-700",
  pink: "bg-pink-100 dark:bg-pink-900 border-pink-300 dark:border-pink-700",
  cyan: "bg-cyan-100 dark:bg-cyan-900 border-cyan-300 dark:border-cyan-700",
  yellow: "bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700",
  red: "bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700",
  indigo: "bg-indigo-100 dark:bg-indigo-900 border-indigo-300 dark:border-indigo-700",
  teal: "bg-teal-100 dark:bg-teal-900 border-teal-300 dark:border-teal-700",
  lime: "bg-lime-100 dark:bg-lime-900 border-lime-300 dark:border-lime-700",
  amber: "bg-amber-100 dark:bg-amber-900 border-amber-300 dark:border-amber-700",
  rose: "bg-rose-100 dark:bg-rose-900 border-rose-300 dark:border-rose-700",
  slate: "bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600",
  zinc: "bg-zinc-200 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600",
  // Gradients
  "gradient-blue-purple": "bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 border-blue-300 dark:border-purple-700",
  "gradient-green-teal": "bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 border-emerald-300 dark:border-teal-700",
  "gradient-orange-red": "bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 border-orange-300 dark:border-red-700",
  "gradient-pink-purple": "bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 border-pink-300 dark:border-purple-700",
  "gradient-cyan-blue": "bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900 dark:to-blue-900 border-cyan-300 dark:border-blue-700",
  "gradient-yellow-orange": "bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 border-yellow-300 dark:border-orange-700",
  "gradient-indigo-pink": "bg-gradient-to-r from-indigo-100 to-pink-100 dark:from-indigo-900 dark:to-pink-900 border-indigo-300 dark:border-pink-700",
  "gradient-teal-cyan": "bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-teal-900 dark:to-cyan-900 border-teal-300 dark:border-cyan-700",
  "gradient-rose-orange": "bg-gradient-to-r from-rose-100 to-orange-100 dark:from-rose-900 dark:to-orange-900 border-rose-300 dark:border-orange-700",
  "gradient-purple-blue": "bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 border-purple-300 dark:border-blue-700",
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
