import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ICON_CATEGORIES } from "@shared/schema";
import { DynamicIcon } from "./dynamic-icon";
import { Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

const categoryShortNames: Record<string, string> = {
  "DevOps & CI/CD": "DevOps",
  "Cloud & Infrastructure": "Cloud",
  "Containers & Orchestration": "Containers",
  "Storage & Databases": "Storage",
  "Compute & Processing": "Compute",
  "Network & Security": "Network",
  "Monitoring & Logging": "Monitoring",
  "Development Tools": "Dev Tools",
  "Collaboration & Communication": "Collab",
  "General": "General",
  "Payment & Commerce": "Payment",
  "Social & Media": "Social",
  "Storage Services": "Cloud Storage",
};

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = Object.keys(ICON_CATEGORIES) as (keyof typeof ICON_CATEGORIES)[];
  
  const allIcons = Object.values(ICON_CATEGORIES).flat();
  
  const getFilteredIcons = () => {
    let icons: readonly string[];
    
    if (activeCategory === "all") {
      icons = allIcons;
    } else {
      icons = ICON_CATEGORIES[activeCategory as keyof typeof ICON_CATEGORIES] || [];
    }
    
    if (search) {
      return icons.filter(icon => 
        icon.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    return icons;
  };

  const filteredIcons = getFilteredIcons();

  const handleSelect = (icon: string) => {
    onChange(icon);
    setOpen(false);
    setSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between gap-2"
          data-testid="button-icon-picker"
        >
          <div className="flex items-center gap-2">
            <DynamicIcon name={value} className="h-5 w-5" />
            <span>{value}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Choose an Icon</DialogTitle>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-icon-search"
          />
        </div>

        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <ScrollArea className="w-full">
            <TabsList className="w-full flex-wrap h-auto gap-1 bg-transparent p-0 mb-4">
              <TabsTrigger 
                value="all" 
                className="text-xs px-2 py-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                All
              </TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="text-xs px-2 py-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {categoryShortNames[category] || category}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>

          <TabsContent value={activeCategory} className="mt-0">
            <ScrollArea className="h-[400px]">
              {filteredIcons.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No icons found
                </div>
              ) : (
                <div className="grid grid-cols-8 gap-2 p-1">
                  {filteredIcons.map((icon) => (
                    <Button
                      key={icon}
                      variant="ghost"
                      className={cn(
                        "flex flex-col items-center gap-1 h-auto py-2 px-1",
                        value === icon && "bg-accent ring-2 ring-primary"
                      )}
                      onClick={() => handleSelect(icon)}
                      data-testid={`button-icon-${icon.toLowerCase()}`}
                    >
                      <DynamicIcon name={icon} className="h-6 w-6" />
                      <span className="text-[10px] text-muted-foreground truncate max-w-full">
                        {icon}
                      </span>
                    </Button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
