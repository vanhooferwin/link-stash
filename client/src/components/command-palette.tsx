import { useState, useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DynamicIcon } from "./dynamic-icon";
import { Search, ExternalLink, Zap, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Bookmark, ApiCall, Category } from "@shared/schema";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookmarks: Bookmark[];
  apiCalls: ApiCall[];
  categories: Category[];
  onOpenBookmark: (bookmark: Bookmark) => void;
  onExecuteApiCall: (apiCall: ApiCall) => void;
}

type SearchResult = 
  | { type: "bookmark"; item: Bookmark; category?: Category }
  | { type: "apiCall"; item: ApiCall; category?: Category };

export function CommandPalette({
  open,
  onOpenChange,
  bookmarks,
  apiCalls,
  categories,
  onOpenBookmark,
  onExecuteApiCall,
}: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || "General";
  };

  const getResults = useCallback((): SearchResult[] => {
    if (!search.trim()) {
      const allResults: SearchResult[] = [
        ...bookmarks.map(b => ({ 
          type: "bookmark" as const, 
          item: b, 
          category: categories.find(c => c.id === b.categoryId) 
        })),
        ...apiCalls.map(a => ({ 
          type: "apiCall" as const, 
          item: a, 
          category: categories.find(c => c.id === a.categoryId) 
        })),
      ];
      return allResults;
    }

    const searchLower = search.toLowerCase();
    const results: SearchResult[] = [];

    bookmarks.forEach(bookmark => {
      if (bookmark.name.toLowerCase().includes(searchLower)) {
        results.push({ 
          type: "bookmark", 
          item: bookmark, 
          category: categories.find(c => c.id === bookmark.categoryId) 
        });
      }
    });

    apiCalls.forEach(apiCall => {
      if (apiCall.name.toLowerCase().includes(searchLower)) {
        results.push({ 
          type: "apiCall", 
          item: apiCall, 
          category: categories.find(c => c.id === apiCall.categoryId) 
        });
      }
    });

    return results;
  }, [search, bookmarks, apiCalls, categories]);

  const results = getResults();

  const groupedResults = results.reduce((acc, result) => {
    const categoryName = result.category?.name || "General";
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const flatResults = Object.values(groupedResults).flat();

  useEffect(() => {
    if (open) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, flatResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && flatResults.length > 0) {
      e.preventDefault();
      const selected = flatResults[selectedIndex];
      if (selected) {
        handleSelect(selected);
      }
    } else if (e.key === "Escape") {
      onOpenChange(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    if (result.type === "bookmark") {
      onOpenBookmark(result.item);
    } else {
      onExecuteApiCall(result.item);
    }
    onOpenChange(false);
  };

  useEffect(() => {
    const selectedElement = resultsRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    selectedElement?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const bookmarkCount = results.filter(r => r.type === "bookmark").length;
  const apiCallCount = results.filter(r => r.type === "apiCall").length;

  let currentIndex = -1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl p-0 gap-0 overflow-hidden glass-command-palette"
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center border-b px-4 py-3">
          <Search className="h-5 w-5 text-muted-foreground mr-3" />
          <Input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bookmarks and API calls..."
            className="border-0 p-0 h-auto text-base focus-visible:ring-0 bg-transparent"
            data-testid="input-command-search"
          />
          <kbd className="ml-auto pointer-events-none h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-xs font-medium opacity-70 hidden sm:flex">
            ESC
          </kbd>
        </div>

        {results.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 border-b text-xs">
            {bookmarkCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 rounded bg-blue-500/20 text-blue-400">
                <ExternalLink className="h-3 w-3" />
                Bookmarks: {bookmarkCount}
              </span>
            )}
            {apiCallCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 rounded bg-purple-500/20 text-purple-400">
                <Zap className="h-3 w-3" />
                API Calls: {apiCallCount}
              </span>
            )}
          </div>
        )}

        <ScrollArea className="max-h-[400px]">
          <div ref={resultsRef} className="py-2">
            {Object.entries(groupedResults).length === 0 ? (
              <div className="px-4 py-8 text-center text-muted-foreground">
                No results found
              </div>
            ) : (
              Object.entries(groupedResults).map(([categoryName, categoryResults]) => (
                <div key={categoryName}>
                  <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {categoryName}
                  </div>
                  {categoryResults.map((result) => {
                    currentIndex++;
                    const index = currentIndex;
                    const isSelected = index === selectedIndex;
                    
                    return (
                      <button
                        key={`${result.type}-${result.item.id}`}
                        data-index={index}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                          isSelected ? "bg-accent" : "hover:bg-accent/50"
                        )}
                        onClick={() => handleSelect(result)}
                        data-testid={`command-result-${result.item.id}`}
                      >
                        <div className={cn(
                          "flex-shrink-0 p-2 rounded-lg",
                          result.type === "bookmark" ? "bg-blue-500/20" : "bg-purple-500/20"
                        )}>
                          <DynamicIcon 
                            name={result.item.icon} 
                            className={cn(
                              "h-5 w-5",
                              result.type === "bookmark" ? "text-blue-400" : "text-purple-400"
                            )} 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {result.item.name}
                          </div>
                          {result.item.description && (
                            <div className="text-sm text-muted-foreground truncate">
                              {result.item.description}
                            </div>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border bg-muted font-mono text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded border bg-muted font-mono text-[10px]">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border bg-muted font-mono text-[10px]">Enter</kbd>
              Open
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
