import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Bookmark, Zap, Loader2, Settings, Eye, ChevronDown, Image, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ThemeToggle } from "@/components/theme-toggle";
import { BookmarkCard } from "@/components/bookmark-card";
import { ApiCallCard } from "@/components/api-call-card";
import { BookmarkModal } from "@/components/bookmark-modal";
import { ApiCallModal } from "@/components/api-call-modal";
import { ResponseModal } from "@/components/response-modal";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Category, Bookmark as BookmarkType, ApiCall, ApiResponse, InsertBookmark, InsertApiCall, Settings as SettingsType } from "@shared/schema";

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
    mutationFn: (data: Partial<SettingsType>) => apiRequest("PATCH", "/api/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Settings updated" });
      setShowBgInput(false);
    },
    onError: () => {
      toast({ title: "Failed to update settings", variant: "destructive" });
    },
  });

  const handleSetBackground = () => {
    updateSettingsMutation.mutate({ backgroundImageUrl: bgInputValue || undefined });
  };

  const backgroundImageUrl = settings?.backgroundImageUrl;

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

  // Run health checks on initial load
  useEffect(() => {
    if (bookmarks.length > 0 && !bookmarksLoading) {
      const hasUnknownHealth = bookmarks.some(b => b.healthCheckEnabled && b.healthStatus === "unknown");
      if (hasUnknownHealth) {
        refreshAllHealthChecks();
      }
    }
  }, [bookmarksLoading]);

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
    mutationFn: (data: InsertBookmark) => apiRequest("POST", "/api/bookmarks", data),
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      setBookmarkModalOpen(false);
      setEditingBookmark(null);
      toast({ title: "Bookmark created successfully" });
      
      // Run health check immediately if enabled
      const bookmark = response as BookmarkType;
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
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertBookmark> }) =>
      apiRequest("PATCH", `/api/bookmarks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      setBookmarkModalOpen(false);
      setEditingBookmark(null);
      toast({ title: "Bookmark updated successfully" });
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
      bookmark.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredApiCalls = apiCalls.filter((apiCall) => {
    const matchesCategory = !selectedCategoryId || apiCall.categoryId === selectedCategoryId;
    const matchesSearch = !searchQuery ||
      apiCall.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apiCall.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apiCall.url.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

  const handleBookmarkSubmit = (data: InsertBookmark) => {
    if (editingBookmark) {
      updateBookmarkMutation.mutate({ id: editingBookmark.id, data });
    } else {
      createBookmarkMutation.mutate(data);
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

  const handleApiCallSubmit = (data: InsertApiCall) => {
    if (editingApiCall) {
      updateApiCallMutation.mutate({ id: editingApiCall.id, data });
    } else {
      createApiCallMutation.mutate(data);
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
            style={{ backgroundImage: `url(${backgroundImageUrl})` }}
          />
        )}
        <AppSidebar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          onCreateCategory={(data) => createCategoryMutation.mutate(data)}
          onUpdateCategory={(id, data) => updateCategoryMutation.mutate({ id, data })}
          onDeleteCategory={(id) => deleteCategoryMutation.mutate(id)}
          isCreating={createCategoryMutation.isPending}
          isUpdating={updateCategoryMutation.isPending}
          editMode={editMode}
          hasBackgroundImage={!!backgroundImageUrl}
        />

        <div className="flex flex-col flex-1 min-w-0">
          <header className={cn(
            "h-[65px] flex items-center justify-between gap-4 px-4 border-b",
            backgroundImageUrl
              ? "glass-header"
              : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          )}>
            <div className="flex items-center gap-4 flex-1">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
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
                  <Image className="h-4 w-4" />
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
              <ThemeToggle />
            </div>
          </header>

          {showBgInput && editMode && (
            <div className={cn(
              "flex items-center gap-2 p-4 border-b",
              backgroundImageUrl ? "bg-background/70 backdrop-blur-xl" : "bg-background"
            )}>
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
                onClick={() => {
                  setBgInputValue("");
                  updateSettingsMutation.mutate({ backgroundImageUrl: undefined });
                }}
                disabled={updateSettingsMutation.isPending}
                data-testid="button-clear-background"
              >
                Clear
              </Button>
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
              <div className="space-y-6">
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
                      <CollapsibleContent className="px-2 pt-2">
                        <div className="space-y-4">
                          {categoryBookmarks.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                              {categoryBookmarks.map((bookmark) => (
                                <BookmarkCard
                                  key={bookmark.id}
                                  bookmark={bookmark}
                                  onEdit={handleEditBookmark}
                                  onDelete={(id) => deleteBookmarkMutation.mutate(id)}
                                  editMode={editMode}
                                  isHealthAnimating={animatingHealthId === bookmark.id}
                                  hasBackgroundImage={!!backgroundImageUrl}
                                />
                              ))}
                            </div>
                          )}
                          {categoryApiCalls.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                              {categoryApiCalls.map((apiCall) => (
                                <ApiCallCard
                                  key={apiCall.id}
                                  apiCall={apiCall}
                                  onEdit={handleEditApiCall}
                                  onDelete={(id) => deleteApiCallMutation.mutate(id)}
                                  onExecute={(apiCall) => executeApiCallMutation.mutate(apiCall)}
                                  editMode={editMode}
                                  isExecuting={executingApiCallId === apiCall.id}
                                  hasBackgroundImage={!!backgroundImageUrl}
                                />
                              ))}
                            </div>
                          )}
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
    </SidebarProvider>
  );
}
