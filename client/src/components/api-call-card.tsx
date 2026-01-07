import { Play, Edit, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DynamicIcon } from "./dynamic-icon";
import { MethodBadge } from "./method-badge";
import type { ApiCall } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ApiCallCardProps {
  apiCall: ApiCall;
  onEdit: (apiCall: ApiCall) => void;
  onDelete: (id: string) => void;
  onExecute: (apiCall: ApiCall) => void;
  isExecuting?: boolean;
  editMode?: boolean;
}

export function ApiCallCard({
  apiCall,
  onEdit,
  onDelete,
  onExecute,
  isExecuting = false,
  editMode = false,
}: ApiCallCardProps) {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(apiCall);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(apiCall.id);
  };

  const handleExecute = (e: React.MouseEvent) => {
    e.stopPropagation();
    onExecute(apiCall);
  };

  return (
    <Card
      className="group relative p-4 border-l-4 border-l-accent transition-all duration-200 hover:shadow-md hover-elevate"
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
          <DynamicIcon name={apiCall.icon} className="h-6 w-6 text-foreground" />
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
          <p
            className="text-xs font-mono text-muted-foreground mt-2 truncate"
            data-testid={`text-api-call-url-${apiCall.id}`}
          >
            {apiCall.url}
          </p>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          size="sm"
          onClick={handleExecute}
          disabled={isExecuting}
          data-testid={`button-execute-api-call-${apiCall.id}`}
        >
          <Play className={cn("h-4 w-4 mr-2", isExecuting && "animate-pulse")} />
          {isExecuting ? "Executing..." : "Execute"}
        </Button>
      </div>
    </Card>
  );
}
