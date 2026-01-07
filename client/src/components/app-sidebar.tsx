import { useState } from "react";
import { Folder, Plus, Edit, Trash2, MoreHorizontal, Bookmark, Zap } from "lucide-react";
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

          <SidebarGroup>
            <SidebarGroupLabel>Quick Stats</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-3 py-2 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Bookmark className="h-4 w-4" />
                    <span>Bookmarks</span>
                  </div>
                  <span className="font-medium" data-testid="text-bookmark-count">-</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    <span>API Calls</span>
                  </div>
                  <span className="font-medium" data-testid="text-api-call-count">-</span>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-sidebar-border">
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
