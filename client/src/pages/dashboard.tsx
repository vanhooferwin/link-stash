import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Bookmark, Zap, Loader2, Settings, Eye, ChevronDown, Wrench, RefreshCw, GripVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { BookmarkCard } from "@/components/bookmark-card";
import { ApiCallCard } from "@/components/api-call-card";
import { BookmarkModal } from "@/components/bookmark-modal";
import { ApiCallModal } from "@/components/api-call-modal";
import { ResponseModal } from "@/components/response-modal";
import { CommandPalette } from "@/components/command-palette";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Category, Bookmark as BookmarkType, ApiCall, ApiResponse, InsertBookmark, InsertApiCall, Settings as SettingsType, SettingsUpdate } from "@shared/schema";

interface DraggableBookmarkCardProps {
  bookmark: BookmarkType;
  onEdit: (bookmark: BookmarkType) => void;
  onDelete: (id: string) => void;
  editMode: boolean;
  isHealthAnimating: boolean;
  hasBackgroundImage: boolean;
  onDragStart: (e: React.DragEvent, bookmark: BookmarkType) => void;
}

function DraggableBookmarkCard({
  bookmark,
  onEdit,
  onDelete,
  editMode,
  isHealthAnimating,
  hasBackgroundImage,
  onDragStart,
}: DraggableBookmarkCardProps) {
  return (
    <div 
      className="relative"
      draggable={editMode}
      onDragStart={(e) => onDragStart(e, bookmark)}
    >
      {editMode && (
        <div
          className="absolute -top-1 -left-1 z-10 p-1 cursor-grab bg-background/80 hover:bg-background rounded shadow-sm border"
          data-testid={`drag-handle-bookmark-${bookmark.id}`}
        >
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>
      )}
      <BookmarkCard
        bookmark={bookmark}
        onEdit={onEdit}
        onDelete={onDelete}
        editMode={editMode}
        isHealthAnimating={isHealthAnimating}
        hasBackgroundImage={hasBackgroundImage}
      />
    </div>
  );
}

interface DraggableApiCallCardProps {
  apiCall: ApiCall;
  onEdit: (apiCall: ApiCall) => void;
  onDelete: (id: string) => void;
  onExecute: (apiCall: ApiCall) => void;
  editMode: boolean;
  isExecuting: boolean;
  hasBackgroundImage: boolean;
  onDragStart: (e: React.DragEvent, apiCall: ApiCall) => void;
}

function DraggableApiCallCard({
  apiCall,
  onEdit,
  onDelete,
  onExecute,
  editMode,
  isExecuting,
  hasBackgroundImage,
  onDragStart,
}: DraggableApiCallCardProps) {
  return (
    <div 
      className="relative"
      draggable={editMode}
      onDragStart={(e) => onDragStart(e, apiCall)}
    >
      {editMode && (
        <div
          className="absolute -top-1 -left-1 z-10 p-1 cursor-grab bg-background/80 hover:bg-background rounded shadow-sm border"
          data-testid={`drag-handle-api-call-${apiCall.id}`}
        >
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>
      )}
      <ApiCallCard
        apiCall={apiCall}
        onEdit={onEdit}
        onDelete={onDelete}
        onExecute={onExecute}
        editMode={editMode}
        isExecuting={isExecuting}
        hasBackgroundImage={hasBackgroundImage}
      />
    </div>
  );
}

interface UnifiedGridProps {
  bookmarks: BookmarkType[];
  apiCalls: ApiCall[];
  columns: number;
  categoryId: string;
  editMode: boolean;
  onEditBookmark: (bookmark: BookmarkType) => void;
  onDeleteBookmark: (id: string) => void;
  onEditApiCall: (apiCall: ApiCall) => void;
  onDeleteApiCall: (id: string) => void;
  onExecuteApiCall: (apiCall: ApiCall) => void;
  onBookmarkDragStart: (e: React.DragEvent, bookmark: BookmarkType) => void;
  onApiCallDragStart: (e: React.DragEvent, apiCall: ApiCall) => void;
  onDragEnter: (categoryId: string, row: number, col: number) => void;
  onDragLeave: () => void;
  onDrop: (categoryId: string, row: number, col: number) => void;
  dropTarget: { row: number; col: number; categoryId: string } | null;
  animatingHealthId: string | null;
  executingApiCallId: string | null;
  hasBackgroundImage: boolean;
}

function UnifiedGrid({
  bookmarks,
  apiCalls,
  columns,
  categoryId,
  editMode,
  onEditBookmark,
  onDeleteBookmark,
  onEditApiCall,
  onDeleteApiCall,
  onExecuteApiCall,
  onBookmarkDragStart,
  onApiCallDragStart,
  onDragEnter,
  onDragLeave,
  onDrop,
  dropTarget,
  animatingHealthId,
  executingApiCallId,
  hasBackgroundImage,
}: UnifiedGridProps) {
  const bookmarkMaxRow = bookmarks.length > 0 ? Math.max(...bookmarks.map(b => b.gridRow ?? 0)) : -1;
  const apiCallMaxRow = apiCalls.length > 0 ? Math.max(...apiCalls.map(a => a.gridRow ?? 0)) : -1;
  const maxRow = Math.max(0, bookmarkMaxRow, apiCallMaxRow);
  const rows = editMode ? maxRow + 2 : maxRow + 1;
  
  const getBookmarkAt = (row: number, col: number) => {
    return bookmarks.find(b => (b.gridRow ?? 0) === row && (b.gridColumn ?? 0) === col);
  };

  const getApiCallAt = (row: number, col: number) => {
    return apiCalls.find(a => (a.gridRow ?? 0) === row && (a.gridColumn ?? 0) === col);
  };

  const isDropTarget = (row: number, col: number) => {
    return dropTarget?.categoryId === categoryId && dropTarget.row === row && dropTarget.col === col;
  };

  return (
    <div 
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: rows }).flatMap((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const bookmark = getBookmarkAt(row, col);
          const apiCall = getApiCallAt(row, col);
          
          if (bookmark) {
            return (
              <div
                key={`bookmark-${bookmark.id}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  onDrop(categoryId, row, col);
                }}
              >
                <DraggableBookmarkCard
                  bookmark={bookmark}
                  onEdit={onEditBookmark}
                  onDelete={onDeleteBookmark}
                  editMode={editMode}
                  isHealthAnimating={animatingHealthId === bookmark.id}
                  hasBackgroundImage={hasBackgroundImage}
                  onDragStart={onBookmarkDragStart}
                />
              </div>
            );
          }
          
          if (apiCall) {
            return (
              <div
                key={`apicall-${apiCall.id}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  onDrop(categoryId, row, col);
                }}
              >
                <DraggableApiCallCard
                  apiCall={apiCall}
                  onEdit={onEditApiCall}
                  onDelete={onDeleteApiCall}
                  onExecute={onExecuteApiCall}
                  editMode={editMode}
                  isExecuting={executingApiCallId === apiCall.id}
                  hasBackgroundImage={hasBackgroundImage}
                  onDragStart={onApiCallDragStart}
                />
              </div>
            );
          }
          
          if (!editMode) {
            return (
              <div
                key={`empty-${row}-${col}`}
                className="min-h-[80px] pointer-events-none"
                aria-hidden="true"
              />
            );
          }
          
          return (
            <div
              key={`empty-${row}-${col}`}
              className={cn(
                "border-2 border-dashed rounded-md transition-colors min-h-[80px]",
                isDropTarget(row, col) ? "border-primary bg-primary/10" : "border-muted-foreground/20"
              )}
              onDragOver={(e) => {
                e.preventDefault();
                onDragEnter(categoryId, row, col);
              }}
              onDragLeave={onDragLeave}
              onDrop={(e) => {
                e.preventDefault();
                onDrop(categoryId, row, col);
              }}
              data-testid={`grid-cell-${row}-${col}`}
            />
          );
        })
      )}
    </div>
  );
}

export default function Dashboard() {
  const { toast } = useToast();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkModalOpen, setBookmarkModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<BookmarkType | null>(null);
  const [apiCallModalOpen, setApiCallModalOpen] = useState(false);
  const [editingApiCall, setEditingApiCall] = useState<ApiCall | null>(null);
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<{ apiCall: ApiCall; response: ApiResponse | null; error: string | null } | null>(null);
  const [executingApiCallId, setExecutingApiCallId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [animatingHealthId, setAnimatingHealthId] = useState<string | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [showBgInput, setShowBgInput] = useState(false);
  const [bgInputValue, setBgInputValue] = useState("");
  const [isRefreshingHealth, setIsRefreshingHealth] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [draggingItem, setDraggingItem] = useState<{ type: 'bookmark' | 'apiCall'; id: string } | null>(null);
  const [dropTarget, setDropTarget] = useState<{ row: number; col: number; categoryId: string } | null>(null);
  const [localBrightness, setLocalBrightness] = useState(100);
  const [localOpacity, setLocalOpacity] = useState(100);
  const [localHealthInterval, setLocalHealthInterval] = useState(1);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: bookmarks = [], isLoading: bookmarksLoading } = useQuery<BookmarkType[]>({
    queryKey: ["/api/bookmarks"],
  });

  const { data: apiCalls = [], isLoading: apiCallsLoading } = useQuery<ApiCall[]>({
    queryKey: ["/api/api-calls"],
  });

  const { data: settings } = useQuery<SettingsType>({
    queryKey: ["/api/settings"],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: SettingsUpdate) => apiRequest("PATCH", "/api/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: () => {
      toast({ title: "Failed to update settings", variant: "destructive" });
    },
  });

  const handleSetBackground = () => {
    updateSettingsMutation.mutate({ backgroundImageUrl: bgInputValue || undefined }, {
      onSuccess: () => {
        toast({ title: "Background updated" });
        setShowBgInput(false);
      }
    });
  };

  const handleClearBackground = () => {
    setBgInputValue("");
    updateSettingsMutation.mutate({ backgroundImageUrl: null }, {
      onSuccess: () => {
        toast({ title: "Background cleared" });
        setShowBgInput(false);
      }
    });
  };

  const backgroundImageUrl = settings?.backgroundImageUrl;
  const backgroundBrightness = settings?.backgroundBrightness ?? 100;
  const backgroundOpacity = settings?.backgroundOpacity ?? 100;
  const healthCheckInterval = settings?.healthCheckInterval ?? 60;

  // Sync local state when settings load
  useEffect(() => {
    if (settings) {
      setLocalBrightness(settings.backgroundBrightness ?? 100);
      setLocalOpacity(settings.backgroundOpacity ?? 100);
      setLocalHealthInterval(Math.round((settings.healthCheckInterval ?? 60) / 60));
    }
  }, [settings]);

  // Apply background image to body for toast glass effect
  useEffect(() => {
    if (backgroundImageUrl) {
      document.body.style.backgroundImage = `url(${backgroundImageUrl})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
      document.body.style.backgroundAttachment = 'fixed';
    } else {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundRepeat = '';
      document.body.style.backgroundAttachment = '';
    }
    return () => {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundRepeat = '';
      document.body.style.backgroundAttachment = '';
    };
  }, [backgroundImageUrl]);

  // Function to refresh all health checks
  const refreshAllHealthChecks = async () => {
    const bookmarksWithHealth = bookmarks.filter(b => b.healthCheckEnabled);
    if (bookmarksWithHealth.length === 0) return;
    
    setIsRefreshingHealth(true);
    
    for (const bookmark of bookmarksWithHealth) {
      setAnimatingHealthId(bookmark.id);
      try {
        await apiRequest("POST", `/api/bookmarks/${bookmark.id}/health`);
      } catch {
        // Silently fail individual checks
      }
    }
    
    queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
    setAnimatingHealthId(null);
    setIsRefreshingHealth(false);
  };

  // Run health checks on initial load and on interval
  useEffect(() => {
    if (bookmarks.length > 0 && !bookmarksLoading) {
      const hasUnknownHealth = bookmarks.some(b => b.healthCheckEnabled && b.healthStatus === "unknown");
      if (hasUnknownHealth) {
        refreshAllHealthChecks();
      }
    }
  }, [bookmarksLoading]);

  // Automatic health checks on interval
  useEffect(() => {
    if (!healthCheckInterval || bookmarksLoading) return;
    
    const intervalMs = healthCheckInterval * 1000;
    const intervalId = setInterval(() => {
      refreshAllHealthChecks();
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [healthCheckInterval, bookmarksLoading]);

  const createCategoryMutation = useMutation({
    mutationFn: (data: { name: string; order: number }) =>
      apiRequest("POST", "/api/categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Category created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create category", variant: "destructive" });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; order: number } }) =>
      apiRequest("PATCH", `/api/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Category updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update category", variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      if (selectedCategoryId) setSelectedCategoryId(null);
      toast({ title: "Category deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete category", variant: "destructive" });
    },
  });

  const createBookmarkMutation = useMutation({
    mutationFn: async (data: InsertBookmark) => {
      const response = await apiRequest("POST", "/api/bookmarks", data);
      return response.json() as Promise<BookmarkType>;
    },
    onSuccess: async (bookmark) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      setBookmarkModalOpen(false);
      setEditingBookmark(null);
      toast({ title: "Bookmark created successfully" });
      
      // Run health check immediately if enabled
      if (bookmark.healthCheckEnabled) {
        try {
          await apiRequest("POST", `/api/bookmarks/${bookmark.id}/health`);
          queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
        } catch {
          // Silently fail - health check will be visible in UI
        }
      }
    },
    onError: () => {
      toast({ title: "Failed to create bookmark", variant: "destructive" });
    },
  });

  const updateBookmarkMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertBookmark> }) => {
      const response = await apiRequest("PATCH", `/api/bookmarks/${id}`, data);
      return { id, bookmark: await response.json() as BookmarkType };
    },
    onSuccess: async ({ id, bookmark }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      setBookmarkModalOpen(false);
      setEditingBookmark(null);
      toast({ title: "Bookmark updated successfully" });
      
      // Run health check immediately if enabled
      if (bookmark.healthCheckEnabled) {
        try {
          await apiRequest("POST", `/api/bookmarks/${id}/health`);
          queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
        } catch {
          // Silently fail - health check will be visible in UI
        }
      }
    },
    onError: () => {
      toast({ title: "Failed to update bookmark", variant: "destructive" });
    },
  });

  const deleteBookmarkMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/bookmarks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      toast({ title: "Bookmark deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete bookmark", variant: "destructive" });
    },
  });


  const createApiCallMutation = useMutation({
    mutationFn: (data: InsertApiCall) => apiRequest("POST", "/api/api-calls", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-calls"] });
      setApiCallModalOpen(false);
      setEditingApiCall(null);
      toast({ title: "API call created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create API call", variant: "destructive" });
    },
  });

  const updateApiCallMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertApiCall> }) =>
      apiRequest("PATCH", `/api/api-calls/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-calls"] });
      setApiCallModalOpen(false);
      setEditingApiCall(null);
      toast({ title: "API call updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update API call", variant: "destructive" });
    },
  });

  const deleteApiCallMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/api-calls/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-calls"] });
      toast({ title: "API call deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete API call", variant: "destructive" });
    },
  });

  const reorderCategoriesMutation = useMutation({
    mutationFn: (ids: string[]) => apiRequest("POST", "/api/categories/reorder", { ids }),
    onMutate: async (ids: string[]) => {
      await queryClient.cancelQueries({ queryKey: ["/api/categories"] });
      const previousCategories = queryClient.getQueryData<Category[]>(["/api/categories"]);
      queryClient.setQueryData(["/api/categories"], (old: Category[] | undefined) => {
        if (!old) return old;
        return ids.map((id, index) => {
          const cat = old.find(c => c.id === id);
          return cat ? { ...cat, order: index } : null;
        }).filter(Boolean) as Category[];
      });
      return { previousCategories };
    },
    onError: (_err, _ids, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(["/api/categories"], context.previousCategories);
      }
      toast({ title: "Failed to reorder categories", variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
  });

  const reorderBookmarksMutation = useMutation({
    mutationFn: (ids: string[]) => apiRequest("POST", "/api/bookmarks/reorder", { ids }),
    onMutate: async (ids: string[]) => {
      await queryClient.cancelQueries({ queryKey: ["/api/bookmarks"] });
      const previousBookmarks = queryClient.getQueryData<BookmarkType[]>(["/api/bookmarks"]);
      queryClient.setQueryData(["/api/bookmarks"], (old: BookmarkType[] | undefined) => {
        if (!old) return old;
        const reorderedIds = new Set(ids);
        const unchanged = old.filter(b => !reorderedIds.has(b.id));
        const reordered = ids.map((id, index) => {
          const bookmark = old.find(b => b.id === id);
          return bookmark ? { ...bookmark, order: index } : null;
        }).filter(Boolean) as BookmarkType[];
        return [...unchanged, ...reordered];
      });
      return { previousBookmarks };
    },
    onError: (_err, _ids, context) => {
      if (context?.previousBookmarks) {
        queryClient.setQueryData(["/api/bookmarks"], context.previousBookmarks);
      }
      toast({ title: "Failed to reorder bookmarks", variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
    },
  });

  const updateBookmarkGridPositionMutation = useMutation({
    mutationFn: ({ id, gridRow, gridColumn }: { id: string; gridRow: number; gridColumn: number }) =>
      apiRequest("PATCH", `/api/bookmarks/${id}/grid-position`, { gridRow, gridColumn }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
    },
    onError: () => {
      toast({ title: "Failed to update position", variant: "destructive" });
    },
  });

  const updateApiCallGridPositionMutation = useMutation({
    mutationFn: ({ id, gridRow, gridColumn }: { id: string; gridRow: number; gridColumn: number }) =>
      apiRequest("PATCH", `/api/api-calls/${id}/grid-position`, { gridRow, gridColumn }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-calls"] });
    },
    onError: () => {
      toast({ title: "Failed to update position", variant: "destructive" });
    },
  });

  const reorderApiCallsMutation = useMutation({
    mutationFn: (ids: string[]) => apiRequest("POST", "/api/api-calls/reorder", { ids }),
    onMutate: async (ids: string[]) => {
      await queryClient.cancelQueries({ queryKey: ["/api/api-calls"] });
      const previousApiCalls = queryClient.getQueryData<ApiCall[]>(["/api/api-calls"]);
      queryClient.setQueryData(["/api/api-calls"], (old: ApiCall[] | undefined) => {
        if (!old) return old;
        const reorderedIds = new Set(ids);
        const unchanged = old.filter(a => !reorderedIds.has(a.id));
        const reordered = ids.map((id, index) => {
          const apiCall = old.find(a => a.id === id);
          return apiCall ? { ...apiCall, order: index } : null;
        }).filter(Boolean) as ApiCall[];
        return [...unchanged, ...reordered];
      });
      return { previousApiCalls };
    },
    onError: (_err, _ids, context) => {
      if (context?.previousApiCalls) {
        queryClient.setQueryData(["/api/api-calls"], context.previousApiCalls);
      }
      toast({ title: "Failed to reorder API calls", variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-calls"] });
    },
  });

  const handleBookmarkDragStart = useCallback((e: React.DragEvent, bookmark: BookmarkType) => {
    e.dataTransfer.setData("text/plain", bookmark.id);
    e.dataTransfer.effectAllowed = "move";
    setDraggingItem({ type: 'bookmark', id: bookmark.id });
  }, []);

  const handleApiCallDragStart = useCallback((e: React.DragEvent, apiCall: ApiCall) => {
    e.dataTransfer.setData("text/plain", apiCall.id);
    e.dataTransfer.effectAllowed = "move";
    setDraggingItem({ type: 'apiCall', id: apiCall.id });
  }, []);

  const handleDragEnter = useCallback((categoryId: string, row: number, col: number) => {
    setDropTarget({ row, col, categoryId });
  }, []);

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback((categoryId: string, row: number, col: number) => {
    if (!draggingItem) return;
    
    // Check if cell is occupied by any bookmark (except the one being dragged if it's a bookmark)
    const bookmarkOccupied = bookmarks.some(
      b => b.categoryId === categoryId && 
           (b.gridRow ?? 0) === row && 
           (b.gridColumn ?? 0) === col && 
           !(draggingItem.type === 'bookmark' && b.id === draggingItem.id)
    );
    
    // Check if cell is occupied by any API call (except the one being dragged if it's an API call)
    const apiCallOccupied = apiCalls.some(
      a => a.categoryId === categoryId && 
           (a.gridRow ?? 0) === row && 
           (a.gridColumn ?? 0) === col && 
           !(draggingItem.type === 'apiCall' && a.id === draggingItem.id)
    );
    
    if (bookmarkOccupied || apiCallOccupied) {
      toast({ title: "Cell is already occupied", variant: "destructive" });
      setDraggingItem(null);
      setDropTarget(null);
      return;
    }
    
    if (draggingItem.type === 'bookmark') {
      updateBookmarkGridPositionMutation.mutate({
        id: draggingItem.id,
        gridRow: row,
        gridColumn: col,
      });
    } else {
      updateApiCallGridPositionMutation.mutate({
        id: draggingItem.id,
        gridRow: row,
        gridColumn: col,
      });
    }
    
    setDraggingItem(null);
    setDropTarget(null);
  }, [draggingItem, bookmarks, apiCalls, updateBookmarkGridPositionMutation, updateApiCallGridPositionMutation, toast]);

  const handleDragEnd = useCallback(() => {
    setDraggingItem(null);
    setDropTarget(null);
  }, []);

  const executeApiCallMutation = useMutation({
    mutationFn: async (apiCall: ApiCall) => {
      setExecutingApiCallId(apiCall.id);
      const response = await apiRequest("POST", `/api/api-calls/${apiCall.id}/execute`);
      return { apiCall, response: await response.json() };
    },
    onSuccess: ({ apiCall, response }) => {
      setExecutingApiCallId(null);
      
      if (apiCall.responseValidationEnabled && response.validationResult) {
        if (response.validationResult.passed) {
          toast({ title: `${apiCall.name}: OK` });
        } else {
          toast({ 
            title: `${apiCall.name}: FAILED`, 
            description: response.validationResult.reason,
            variant: "destructive" 
          });
        }
      } else {
        setCurrentResponse({ apiCall, response, error: null });
        setResponseModalOpen(true);
      }
    },
    onError: (error: Error, apiCall) => {
      setExecutingApiCallId(null);
      
      if (apiCall.responseValidationEnabled) {
        toast({ 
          title: `${apiCall.name}: FAILED`, 
          description: error.message,
          variant: "destructive" 
        });
      } else {
        setCurrentResponse({ apiCall, response: null, error: error.message });
        setResponseModalOpen(true);
      }
    },
  });

  const filteredBookmarks = bookmarks.filter((bookmark) => {
    const matchesCategory = !selectedCategoryId || bookmark.categoryId === selectedCategoryId;
    const matchesSearch = !searchQuery || 
      bookmark.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredApiCalls = apiCalls.filter((apiCall) => {
    const matchesCategory = !selectedCategoryId || apiCall.categoryId === selectedCategoryId;
    const matchesSearch = !searchQuery ||
      apiCall.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleOpenBookmark = (bookmark: BookmarkType) => {
    window.open(bookmark.url, "_blank");
  };

  const handleExecuteApiCallFromPalette = (apiCall: ApiCall) => {
    executeApiCallMutation.mutate(apiCall);
  };

  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const getBookmarksByCategory = (categoryId: string) => 
    filteredBookmarks.filter(b => b.categoryId === categoryId);

  const getApiCallsByCategory = (categoryId: string) => 
    filteredApiCalls.filter(a => a.categoryId === categoryId);

  const categoriesWithItems = categories.filter(cat => 
    getBookmarksByCategory(cat.id).length > 0 || getApiCallsByCategory(cat.id).length > 0
  );

  const handleAddBookmark = () => {
    setEditingBookmark(null);
    setBookmarkModalOpen(true);
  };

  const handleEditBookmark = (bookmark: BookmarkType) => {
    setEditingBookmark(bookmark);
    setBookmarkModalOpen(true);
  };

  const handleBookmarkSubmit = (data: Omit<InsertBookmark, 'gridRow' | 'gridColumn'>) => {
    if (editingBookmark) {
      updateBookmarkMutation.mutate({ id: editingBookmark.id, data: data as InsertBookmark });
    } else {
      const nextPosition = findNextGridPosition(data.categoryId);
      createBookmarkMutation.mutate({
        ...data,
        gridRow: nextPosition.row,
        gridColumn: nextPosition.col,
      });
    }
  };

  const findNextGridPosition = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    const columns = category?.columns ?? 4;
    
    // Get all items in this category (both bookmarks and API calls)
    const categoryBookmarks = bookmarks.filter(b => b.categoryId === categoryId);
    const categoryApiCalls = apiCalls.filter(a => a.categoryId === categoryId);
    
    // Combine occupied positions from both types
    const occupied = new Set([
      ...categoryBookmarks.map(b => `${b.gridRow ?? 0}-${b.gridColumn ?? 0}`),
      ...categoryApiCalls.map(a => `${a.gridRow ?? 0}-${a.gridColumn ?? 0}`)
    ]);
    
    for (let row = 0; ; row++) {
      for (let col = 0; col < columns; col++) {
        if (!occupied.has(`${row}-${col}`)) {
          return { row, col };
        }
      }
    }
  };

  const handleAddApiCall = () => {
    setEditingApiCall(null);
    setApiCallModalOpen(true);
  };

  const handleEditApiCall = (apiCall: ApiCall) => {
    setEditingApiCall(apiCall);
    setApiCallModalOpen(true);
  };

  const handleApiCallSubmit = (data: Omit<InsertApiCall, 'gridRow' | 'gridColumn'>) => {
    if (editingApiCall) {
      updateApiCallMutation.mutate({ id: editingApiCall.id, data: data as InsertApiCall });
    } else {
      const nextPosition = findNextGridPosition(data.categoryId);
      createApiCallMutation.mutate({
        ...data,
        gridRow: nextPosition.row,
        gridColumn: nextPosition.col,
      });
    }
  };

  const isLoading = categoriesLoading || bookmarksLoading || apiCallsLoading;

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full relative" data-has-bg={backgroundImageUrl ? "true" : "false"}>
        {backgroundImageUrl && (
          <div
            className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
            style={{ 
              backgroundImage: `url(${backgroundImageUrl})`,
              filter: `brightness(${localBrightness / 100})`,
              opacity: localOpacity / 100,
            }}
          />
        )}
        <AppSidebar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          onCreateCategory={(data) => createCategoryMutation.mutate(data)}
          onUpdateCategory={(id, data) => updateCategoryMutation.mutate({ id, data })}
          onDeleteCategory={(id) => deleteCategoryMutation.mutate(id)}
          onReorderCategories={(ids) => reorderCategoriesMutation.mutate(ids)}
          isCreating={createCategoryMutation.isPending}
          isUpdating={updateCategoryMutation.isPending}
          editMode={editMode}
          hasBackgroundImage={!!backgroundImageUrl}
        />

        <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
          <header className={cn(
            "h-[65px] flex items-center justify-between gap-4 px-4 border-b",
            backgroundImageUrl
              ? "glass-header"
              : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          )}>
            <div className="flex items-center gap-4 flex-1">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  type="search"
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn("pl-9", backgroundImageUrl && "glass-input")}
                  data-testid="input-search"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {editMode && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button data-testid="button-add-new">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleAddBookmark} data-testid="menu-add-bookmark">
                      <Bookmark className="h-4 w-4 mr-2" />
                      Add Bookmark
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleAddApiCall} data-testid="menu-add-api-call">
                      <Zap className="h-4 w-4 mr-2" />
                      Add API Call
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {editMode && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setBgInputValue(backgroundImageUrl || "");
                    setShowBgInput(!showBgInput);
                  }}
                  data-testid="button-background-settings"
                >
                  <Wrench className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={refreshAllHealthChecks}
                disabled={isRefreshingHealth}
                data-testid="button-refresh-health"
              >
                <RefreshCw className={cn("h-4 w-4", isRefreshingHealth && "animate-spin")} />
              </Button>
              <Button
                variant={editMode ? "default" : "outline"}
                size="icon"
                onClick={() => setEditMode(!editMode)}
                data-testid="button-toggle-edit-mode"
              >
                {editMode ? <Eye className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
              </Button>
            </div>
          </header>

          {showBgInput && editMode && (
            <div className="flex flex-col gap-4 p-4 border-b bg-background/70 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <Input
                  type="url"
                  placeholder="Background image URL (e.g., https://images.unsplash.com/...)"
                  value={bgInputValue}
                  onChange={(e) => setBgInputValue(e.target.value)}
                  className="flex-1"
                  data-testid="input-background-url"
                />
                <Button
                  onClick={handleSetBackground}
                  disabled={updateSettingsMutation.isPending}
                  data-testid="button-apply-background"
                >
                  Apply
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClearBackground}
                  disabled={updateSettingsMutation.isPending}
                  data-testid="button-clear-background"
                >
                  Clear
                </Button>
              </div>
              
              {backgroundImageUrl && (
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3 flex-1">
                    <Label className="text-sm text-muted-foreground w-20">Brightness</Label>
                    <Slider
                      value={[localBrightness]}
                      onValueChange={([value]) => setLocalBrightness(value)}
                      min={0}
                      max={200}
                      step={5}
                      className="flex-1"
                      data-testid="slider-brightness"
                    />
                    <span className="text-sm text-muted-foreground w-12 text-right">{localBrightness}%</span>
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <Label className="text-sm text-muted-foreground w-20">Opacity</Label>
                    <Slider
                      value={[localOpacity]}
                      onValueChange={([value]) => setLocalOpacity(value)}
                      min={0}
                      max={100}
                      step={5}
                      className="flex-1"
                      data-testid="slider-opacity"
                    />
                    <span className="text-sm text-muted-foreground w-12 text-right">{localOpacity}%</span>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground whitespace-nowrap">Health Check</Label>
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={localHealthInterval}
                  onChange={(e) => {
                    const minutes = Math.max(1, Math.min(60, parseInt(e.target.value) || 1));
                    setLocalHealthInterval(minutes);
                  }}
                  className="w-16 h-8 text-center"
                  data-testid="input-health-interval"
                />
                <span className="text-sm text-muted-foreground">min</span>
                <Button
                  onClick={() => {
                    updateSettingsMutation.mutate({
                      backgroundBrightness: localBrightness,
                      backgroundOpacity: localOpacity,
                      healthCheckInterval: localHealthInterval * 60,
                    }, {
                      onSuccess: () => toast({ title: "Settings saved" })
                    });
                  }}
                  disabled={updateSettingsMutation.isPending}
                  size="sm"
                  data-testid="button-save-settings"
                >
                  Save
                </Button>
              </div>
            </div>
          )}

          <main className={cn(
            "flex-1 overflow-auto p-6",
            backgroundImageUrl && "bg-transparent"
          )}>
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredBookmarks.length === 0 && filteredApiCalls.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="p-4 bg-muted/50 rounded-full mb-4">
                  <Bookmark className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2" data-testid="text-empty-title">No items found</h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  {searchQuery
                    ? "No bookmarks or API calls match your search."
                    : "Get started by adding your first bookmark or API call."}
                </p>
                {!searchQuery && (
                  <div className="flex gap-2">
                    <Button onClick={handleAddBookmark} data-testid="button-empty-add-bookmark">
                      <Bookmark className="h-4 w-4 mr-2" />
                      Add Bookmark
                    </Button>
                    <Button variant="outline" onClick={handleAddApiCall} data-testid="button-empty-add-api-call">
                      <Zap className="h-4 w-4 mr-2" />
                      Add API Call
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {categoriesWithItems.map((category) => {
                  const categoryBookmarks = getBookmarksByCategory(category.id);
                  const categoryApiCalls = getApiCallsByCategory(category.id);
                  const isCollapsed = collapsedCategories.has(category.id);
                  const totalItems = categoryBookmarks.length + categoryApiCalls.length;
                  // Auto-expand categories when searching
                  const isOpen = searchQuery ? true : !isCollapsed;

                  return (
                    <Collapsible
                      key={category.id}
                      open={isOpen}
                      onOpenChange={() => toggleCategory(category.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-between p-4 h-auto hover-elevate",
                            backgroundImageUrl && "glass-category"
                          )}
                          data-testid={`button-toggle-category-${category.id}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold">{category.name}</span>
                            <span className="text-sm text-muted-foreground">
                              ({totalItems})
                            </span>
                          </div>
                          <ChevronDown className={cn(
                            "h-5 w-5 transition-transform",
                            isCollapsed && "-rotate-90"
                          )} />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-2 pt-4">
                        <div onDragEnd={handleDragEnd}>
                          <UnifiedGrid
                            bookmarks={categoryBookmarks}
                            apiCalls={categoryApiCalls}
                            columns={category.columns ?? 4}
                            categoryId={category.id}
                            editMode={editMode}
                            onEditBookmark={handleEditBookmark}
                            onDeleteBookmark={(id: string) => deleteBookmarkMutation.mutate(id)}
                            onEditApiCall={handleEditApiCall}
                            onDeleteApiCall={(id: string) => deleteApiCallMutation.mutate(id)}
                            onExecuteApiCall={(apiCall: ApiCall) => executeApiCallMutation.mutate(apiCall)}
                            onBookmarkDragStart={handleBookmarkDragStart}
                            onApiCallDragStart={handleApiCallDragStart}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            dropTarget={dropTarget}
                            animatingHealthId={animatingHealthId}
                            executingApiCallId={executingApiCallId}
                            hasBackgroundImage={!!backgroundImageUrl}
                          />
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      <BookmarkModal
        open={bookmarkModalOpen}
        onOpenChange={setBookmarkModalOpen}
        bookmark={editingBookmark}
        categories={categories}
        onSubmit={handleBookmarkSubmit}
        isPending={createBookmarkMutation.isPending || updateBookmarkMutation.isPending}
      />

      <ApiCallModal
        open={apiCallModalOpen}
        onOpenChange={setApiCallModalOpen}
        apiCall={editingApiCall}
        categories={categories}
        onSubmit={handleApiCallSubmit}
        isPending={createApiCallMutation.isPending || updateApiCallMutation.isPending}
      />

      <ResponseModal
        open={responseModalOpen}
        onOpenChange={setResponseModalOpen}
        apiCall={currentResponse?.apiCall || null}
        response={currentResponse?.response || null}
        error={currentResponse?.error}
      />

      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        bookmarks={bookmarks}
        apiCalls={apiCalls}
        categories={categories}
        onOpenBookmark={handleOpenBookmark}
        onExecuteApiCall={handleExecuteApiCallFromPalette}
      />
    </SidebarProvider>
  );
}
