import { useState, useRef } from "react";
import { Folder, Plus, Edit, Trash2, MoreHorizontal, Bookmark, Download, Upload } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CategoryModal } from "./category-modal";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Category } from "@shared/schema";

interface AppSidebarProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  onCreateCategory: (data: { name: string; order: number }) => void;
  onUpdateCategory: (id: string, data: { name: string; order: number }) => void;
  onDeleteCategory: (id: string) => void;
  isCreating?: boolean;
  isUpdating?: boolean;
  editMode?: boolean;
}

export function AppSidebar({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  isCreating = false,
  isUpdating = false,
  editMode = false,
}: AppSidebarProps) {
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      const response = await fetch("/api/config/export");
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bookmarks-backup-${new Date().toISOString().split("T")[0]}.yaml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Configuration exported successfully" });
    } catch {
      toast({ title: "Failed to export configuration", variant: "destructive" });
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const response = await fetch("/api/config/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yaml: text }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Import failed");
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/api-calls"] });
      toast({ title: "Configuration imported successfully" });
    } catch (err) {
      toast({ 
        title: "Failed to import configuration", 
        description: err instanceof Error ? err.message : "Invalid file",
        variant: "destructive" 
      });
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
  };

  const handleCategorySubmit = (data: { name: string; order: number }) => {
    if (editingCategory) {
      onUpdateCategory(editingCategory.id, data);
    } else {
      onCreateCategory(data);
    }
    setCategoryModalOpen(false);
    setEditingCategory(null);
  };

  return (
    <>
      <Sidebar>
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bookmark className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-base" data-testid="text-app-title">Bookmarks</h1>
              <p className="text-xs text-muted-foreground">Dashboard</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between gap-2 pr-2">
              <span>Categories</span>
              {editMode && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleAddCategory}
                  data-testid="button-add-category"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => onSelectCategory(null)}
                    isActive={selectedCategoryId === null}
                    data-testid="button-category-all"
                  >
                    <Folder className="h-4 w-4" />
                    <span>All Bookmarks</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {categories.map((category) => (
                  <SidebarMenuItem key={category.id}>
                    <SidebarMenuButton
                      onClick={() => onSelectCategory(category.id)}
                      isActive={selectedCategoryId === category.id}
                      data-testid={`button-category-${category.id}`}
                    >
                      <Folder className="h-4 w-4" />
                      <span>{category.name}</span>
                    </SidebarMenuButton>
                    {editMode && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-none transition-transform focus-visible:ring-2 peer-data-[size=default]/menu-button:top-1.5 group-data-[collapsible=icon]:hidden peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0"
                            data-testid={`button-category-menu-${category.id}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right" align="start">
                          <DropdownMenuItem
                            onClick={() => handleEditCategory(category)}
                            data-testid={`button-edit-category-${category.id}`}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDeleteCategory(category.id)}
                            className="text-destructive focus:text-destructive"
                            data-testid={`button-delete-category-${category.id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-sidebar-border space-y-3">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleExport}
              data-testid="button-export-config"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleImport}
              data-testid="button-import-config"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".yaml,.yml"
            className="hidden"
            onChange={handleFileChange}
            data-testid="input-import-file"
          />
          <p className="text-xs text-muted-foreground text-center">
            Bookmark Dashboard v1.0
          </p>
        </SidebarFooter>
      </Sidebar>

      <CategoryModal
        open={categoryModalOpen}
        onOpenChange={setCategoryModalOpen}
        category={editingCategory}
        onSubmit={handleCategorySubmit}
        isPending={isCreating || isUpdating}
      />
    </>
  );
}
