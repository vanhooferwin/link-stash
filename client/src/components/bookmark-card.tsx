import { Edit, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DynamicIcon } from "./dynamic-icon";
import { HealthIndicator } from "./health-indicator";
import { CARD_COLORS, type Bookmark } from "@shared/schema";
import { cn } from "@/lib/utils";

function getColorClasses(colorId: string) {
  const color = CARD_COLORS.find(c => c.id === colorId);
  if (!color || colorId === "default") return { bg: "", border: "" };
  return { bg: color.bg, border: color.border };
}

interface BookmarkCardProps {
  bookmark: Bookmark;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  editMode?: boolean;
  isHealthAnimating?: boolean;
  hasBackgroundImage?: boolean;
}

export function BookmarkCard({
  bookmark,
  onEdit,
  onDelete,
  editMode = false,
  isHealthAnimating = false,
  hasBackgroundImage = false,
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

  const colorClasses = getColorClasses(bookmark.color || "default");

  return (
    <a
      href={bookmark.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
      data-testid={`bookmark-link-${bookmark.id}`}
    >
      <Card
        className={cn(
          "group relative p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover-elevate active-elevate-2",
          hasBackgroundImage && !colorClasses.bg ? "bg-card/70 backdrop-blur-xl" : colorClasses.bg,
          colorClasses.border && `border ${colorClasses.border}`
        )}
        data-testid={`bookmark-card-${bookmark.id}`}
      >
        {editMode && (
          <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
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
            <h3
              className="font-semibold text-base truncate"
              data-testid={`text-bookmark-name-${bookmark.id}`}
            >
              {bookmark.name}
            </h3>
            {bookmark.description && (
              <p
                className="text-sm text-muted-foreground mt-1 line-clamp-2"
                data-testid={`text-bookmark-description-${bookmark.id}`}
              >
                {bookmark.description}
              </p>
            )}
          </div>
        </div>
      </Card>
    </a>
  );
}
