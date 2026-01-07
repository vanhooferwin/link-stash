import { useState, useRef } from "react";
import { Folder, Plus, Edit, Trash2, MoreHorizontal, Bookmark, Download, Upload, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  onCreateCategory: (data: { name: string; order: number; columns: number }) => void;
  onUpdateCategory: (id: string, data: { name: string; order: number; columns: number }) => void;
  onDeleteCategory: (id: string) => void;
  onReorderCategories: (categoryIds: string[]) => void;
  isCreating?: boolean;
  isUpdating?: boolean;
  editMode?: boolean;
  hasBackgroundImage?: boolean;
}

interface SortableCategoryItemProps {
  category: Category;
  isActive: boolean;
  editMode: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableCategoryItem({
  category,
  isActive,
  editMode,
  onSelect,
  onEdit,
  onDelete,
}: SortableCategoryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <SidebarMenuItem ref={setNodeRef} style={style}>
      <div className="flex items-center w-full group/menu-item relative">
        {editMode && (
          <button
            {...attributes}
            {...listeners}
            className="p-1 cursor-grab hover:bg-sidebar-accent rounded mr-1"
            data-testid={`drag-handle-category-${category.id}`}
          >
            <GripVertical className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
        <SidebarMenuButton
          onClick={onSelect}
          isActive={isActive}
          data-testid={`button-category-${category.id}`}
          className="flex-1"
        >
          <Folder className="h-4 w-4" />
          <span>{category.name}</span>
        </SidebarMenuButton>
        {editMode && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-none transition-transform focus-visible:ring-2 group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0"
                data-testid={`button-category-menu-${category.id}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start">
              <DropdownMenuItem
                onClick={onEdit}
                data-testid={`button-edit-category-${category.id}`}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
                data-testid={`button-delete-category-${category.id}`}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </SidebarMenuItem>
  );
}

export function AppSidebar({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onReorderCategories,
  isCreating = false,
  isUpdating = false,
  editMode = false,
  hasBackgroundImage = false,
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

  const handleCategorySubmit = (data: { name: string; order: number; columns: number }) => {
    if (editingCategory) {
      onUpdateCategory(editingCategory.id, data);
    } else {
      onCreateCategory(data);
    }
    setCategoryModalOpen(false);
    setEditingCategory(null);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over.id);
      const newOrder = arrayMove(categories, oldIndex, newIndex);
      onReorderCategories(newOrder.map((c) => c.id));
    }
  };

  return (
    <>
      <Sidebar>
        <SidebarHeader className="h-[65px] px-4 flex items-center justify-start border-b border-sidebar-border">
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

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={categories.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {categories.map((category) => (
                      <SortableCategoryItem
                        key={category.id}
                        category={category}
                        isActive={selectedCategoryId === category.id}
                        editMode={editMode}
                        onSelect={() => onSelectCategory(category.id)}
                        onEdit={() => handleEditCategory(category)}
                        onDelete={() => onDeleteCategory(category.id)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-sidebar-border space-y-3">
          {editMode && (
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
          )}
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
