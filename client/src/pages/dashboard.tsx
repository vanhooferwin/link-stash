import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Bookmark, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import type { Category, Bookmark as BookmarkType, ApiCall, ApiResponse, InsertBookmark, InsertApiCall } from "@shared/schema";

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
  const [checkingHealthId, setCheckingHealthId] = useState<string | null>(null);
  const [executingApiCallId, setExecutingApiCallId] = useState<string | null>(null);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: bookmarks = [], isLoading: bookmarksLoading } = useQuery<BookmarkType[]>({
    queryKey: ["/api/bookmarks"],
  });

  const { data: apiCalls = [], isLoading: apiCallsLoading } = useQuery<ApiCall[]>({
    queryKey: ["/api/api-calls"],
  });

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      setBookmarkModalOpen(false);
      setEditingBookmark(null);
      toast({ title: "Bookmark created successfully" });
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

  const healthCheckMutation = useMutation({
    mutationFn: (id: string) => {
      setCheckingHealthId(id);
      return apiRequest("POST", `/api/bookmarks/${id}/health`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      setCheckingHealthId(null);
    },
    onError: () => {
      setCheckingHealthId(null);
      toast({ title: "Health check failed", variant: "destructive" });
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
      setCurrentResponse({ apiCall, response, error: null });
      setResponseModalOpen(true);
    },
    onError: (error: Error, apiCall) => {
      setExecutingApiCallId(null);
      setCurrentResponse({ apiCall, response: null, error: error.message });
      setResponseModalOpen(true);
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
      <div className="flex h-screen w-full">
        <AppSidebar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          onCreateCategory={(data) => createCategoryMutation.mutate(data)}
          onUpdateCategory={(id, data) => updateCategoryMutation.mutate({ id, data })}
          onDeleteCategory={(id) => deleteCategoryMutation.mutate(id)}
          isCreating={createCategoryMutation.isPending}
          isUpdating={updateCategoryMutation.isPending}
        />

        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-4 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
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
                {filteredBookmarks.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Bookmark className="h-5 w-5" />
                      Bookmarks
                      <span className="text-sm font-normal text-muted-foreground">
                        ({filteredBookmarks.length})
                      </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredBookmarks.map((bookmark) => (
                        <BookmarkCard
                          key={bookmark.id}
                          bookmark={bookmark}
                          onEdit={handleEditBookmark}
                          onDelete={(id) => deleteBookmarkMutation.mutate(id)}
                          onHealthCheck={(id) => healthCheckMutation.mutate(id)}
                          isCheckingHealth={checkingHealthId === bookmark.id}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {filteredApiCalls.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      API Calls
                      <span className="text-sm font-normal text-muted-foreground">
                        ({filteredApiCalls.length})
                      </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredApiCalls.map((apiCall) => (
                        <ApiCallCard
                          key={apiCall.id}
                          apiCall={apiCall}
                          onEdit={handleEditApiCall}
                          onDelete={(id) => deleteApiCallMutation.mutate(id)}
                          onExecute={(apiCall) => executeApiCallMutation.mutate(apiCall)}
                          isExecuting={executingApiCallId === apiCall.id}
                        />
                      ))}
                    </div>
                  </section>
                )}
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
