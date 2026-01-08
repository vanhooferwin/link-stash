import { Edit, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DynamicIcon } from "./dynamic-icon";
import { MethodBadge } from "./method-badge";
import { CARD_COLORS, type ApiCall } from "@shared/schema";
import { cn } from "@/lib/utils";

function getColorClasses(colorId: string) {
  const color = CARD_COLORS.find((c) => c.id === colorId);
  if (!color || colorId === "default") return { bg: "", border: "" };
  return { bg: color.bg, border: color.border };
}

interface ApiCallCardProps {
  apiCall: ApiCall;
  onEdit: (apiCall: ApiCall) => void;
  onDelete: (id: string) => void;
  onExecute: (apiCall: ApiCall) => void;
  isExecuting?: boolean;
  editMode?: boolean;
  hasBackgroundImage?: boolean;
}

export function ApiCallCard({
  apiCall,
  onEdit,
  onDelete,
  onExecute,
  isExecuting = false,
  editMode = false,
  hasBackgroundImage = false,
}: ApiCallCardProps) {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(apiCall);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(apiCall.id);
  };

  const colorClasses = getColorClasses(apiCall.color || "default");

  return (
    <Card
      className={cn(
        "group relative p-4 transition-all duration-200 hover:shadow-md hover-elevate min-h-[88px] cursor-pointer",
        hasBackgroundImage && !colorClasses.bg ? "glass-card" : colorClasses.bg,
        colorClasses.border && `border ${colorClasses.border}`,
        isExecuting && "opacity-75",
      )}
      onClick={() => !isExecuting && onExecute(apiCall)}
      data-testid={`api-call-card-${apiCall.id}`}
    >
      {editMode && (
        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleEdit}
                data-testid={`button-edit-api-call-${apiCall.id}`}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive"
                onClick={handleDelete}
                data-testid={`button-delete-api-call-${apiCall.id}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 p-2 bg-accent/50 rounded-lg">
          <DynamicIcon
            name={apiCall.icon}
            className="h-6 w-6 text-foreground"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <MethodBadge method={apiCall.method} />
            <h3
              className="font-semibold text-base truncate"
              data-testid={`text-api-call-name-${apiCall.id}`}
            >
              {apiCall.name}
            </h3>
          </div>
          {apiCall.description && (
            <p
              className="text-sm text-muted-foreground mt-1 line-clamp-2"
              data-testid={`text-api-call-description-${apiCall.id}`}
            >
              {apiCall.description}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
