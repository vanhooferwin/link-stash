import { Edit, Trash2, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DynamicIcon } from "./dynamic-icon";
import { HealthIndicator } from "./health-indicator";
import { CARD_COLORS, type Bookmark } from "@shared/schema";
import { cn } from "@/lib/utils";

const SSL_WARNING_THRESHOLD = 30; // Days before expiry to show warning

function getHealthTooltipMessage(bookmark: Bookmark): string | undefined {
  // No tooltip for healthy (green) status
  if (bookmark.healthStatus === "online") {
    // Check if SSL is expiring soon
    if (bookmark.sslExpiryDays !== null && bookmark.sslExpiryDays <= SSL_WARNING_THRESHOLD) {
      return `SSL certificate expires in ${bookmark.sslExpiryDays} days`;
    }
    return undefined;
  }
  
  if (bookmark.healthStatus === "offline") {
    return "Health check failed - URL is not responding or returned an error";
  }
  
  if (bookmark.healthStatus === "unknown") {
    return "Health check has not been performed yet";
  }
  
  return undefined;
}

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
          hasBackgroundImage && !colorClasses.bg ? "glass-card" : colorClasses.bg,
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
          <div className={cn("absolute top-3 right-3 flex items-center gap-2", editMode && "group-hover:invisible")}>
            {bookmark.sslExpiryDays !== null && bookmark.sslExpiryDays <= SSL_WARNING_THRESHOLD && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    variant="outline" 
                    className="bg-orange-500/20 text-orange-500 border-orange-500/50 text-xs px-1.5 py-0.5"
                    data-testid={`badge-ssl-warning-${bookmark.id}`}
                  >
                    <ShieldAlert className="h-3 w-3 mr-1" />
                    SSL
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  SSL certificate expires in {bookmark.sslExpiryDays} days
                </TooltipContent>
              </Tooltip>
            )}
            <HealthIndicator 
              status={bookmark.healthStatus} 
              isAnimating={isHealthAnimating} 
              tooltipMessage={getHealthTooltipMessage(bookmark)}
            />
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
