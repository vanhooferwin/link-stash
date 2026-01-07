import { ExternalLink, Edit, Trash2, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DynamicIcon } from "./dynamic-icon";
import { HealthIndicator } from "./health-indicator";
import type { Bookmark } from "@shared/schema";
import { cn } from "@/lib/utils";

interface BookmarkCardProps {
  bookmark: Bookmark;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onHealthCheck: (id: string) => void;
  isCheckingHealth?: boolean;
  editMode?: boolean;
  isHealthAnimating?: boolean;
}

export function BookmarkCard({
  bookmark,
  onEdit,
  onDelete,
  onHealthCheck,
  isCheckingHealth = false,
  editMode = false,
  isHealthAnimating = false,
}: BookmarkCardProps) {
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(bookmark);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(bookmark.id);
  };

  const handleHealthCheck = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onHealthCheck(bookmark.id);
  };

  return (
    <a
      href={bookmark.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
      data-testid={`bookmark-link-${bookmark.id}`}
    >
      <Card
        className="group relative p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover-elevate active-elevate-2"
        data-testid={`bookmark-card-${bookmark.id}`}
      >
        {editMode && (
          <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            {bookmark.healthCheckEnabled && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={handleHealthCheck}
                    disabled={isCheckingHealth}
                    data-testid={`button-health-check-${bookmark.id}`}
                  >
                    <RefreshCw
                      className={cn("h-3.5 w-3.5", isCheckingHealth && "animate-spin")}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Check health</TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleEdit}
                  data-testid={`button-edit-bookmark-${bookmark.id}`}
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
                  data-testid={`button-delete-bookmark-${bookmark.id}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        )}

        {bookmark.healthCheckEnabled && (
          <div className={cn("absolute top-3 right-3", editMode && "group-hover:invisible")}>
            <HealthIndicator status={bookmark.healthStatus} isAnimating={isHealthAnimating} />
          </div>
        )}

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-accent/50 rounded-lg">
            <DynamicIcon name={bookmark.icon} className="h-6 w-6 text-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3
                className="font-semibold text-base truncate"
                data-testid={`text-bookmark-name-${bookmark.id}`}
              >
                {bookmark.name}
              </h3>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            </div>
            {bookmark.description && (
              <p
                className="text-sm text-muted-foreground mt-1 line-clamp-2"
                data-testid={`text-bookmark-description-${bookmark.id}`}
              >
                {bookmark.description}
              </p>
            )}
            <p
              className="text-xs font-mono text-muted-foreground mt-2 truncate"
              data-testid={`text-bookmark-url-${bookmark.id}`}
            >
              {bookmark.url}
            </p>
          </div>
        </div>
      </Card>
    </a>
  );
}
