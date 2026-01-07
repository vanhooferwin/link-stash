import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AVAILABLE_ICONS, type IconName } from "@shared/schema";
import { DynamicIcon } from "./dynamic-icon";
import { Search } from "lucide-react";

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredIcons = AVAILABLE_ICONS.filter(icon =>
    icon.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          data-testid="button-icon-picker"
        >
          <DynamicIcon name={value as IconName} className="h-5 w-5" />
          <span>{value}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-icon-search"
            />
          </div>
        </div>
        <ScrollArea className="h-64">
          <div className="grid grid-cols-6 gap-1 p-3">
            {filteredIcons.map((icon) => (
              <Button
                key={icon}
                variant="ghost"
                size="icon"
                className={value === icon ? "bg-accent" : ""}
                onClick={() => {
                  onChange(icon);
                  setOpen(false);
                  setSearch("");
                }}
                data-testid={`button-icon-${icon.toLowerCase()}`}
              >
                <DynamicIcon name={icon} className="h-5 w-5" />
              </Button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
