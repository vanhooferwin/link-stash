import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { IconPicker } from "./icon-picker";
import { ColorPicker } from "./color-picker";
import { ChevronDown } from "lucide-react";
import type { Bookmark, Category, HealthCheckConfig } from "@shared/schema";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  url: z.string().url("Must be a valid URL"),
  icon: z.string().default("Globe"),
  color: z.string().default("default"),
  categoryId: z.string().min(1, "Category is required"),
  healthCheckEnabled: z.boolean().default(false),
  healthCheckConfig: z.object({
    url: z.string().optional(),
    expectedStatus: z.number().default(200),
    jsonKey: z.string().optional(),
    jsonValue: z.string().optional(),
    checkSsl: z.boolean().default(false),
  }).optional(),
  order: z.number().default(0),
});

type FormValues = z.infer<typeof formSchema>;

interface BookmarkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookmark?: Bookmark | null;
  categories: Category[];
  onSubmit: (data: FormValues) => void;
  isPending?: boolean;
}

export function BookmarkModal({
  open,
  onOpenChange,
  bookmark,
  categories,
  onSubmit,
  isPending = false,
}: BookmarkModalProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      url: "",
      icon: "Globe",
      color: "default",
      categoryId: categories[0]?.id || "",
      healthCheckEnabled: false,
      healthCheckConfig: {
        url: "",
        expectedStatus: 200,
        jsonKey: "",
        jsonValue: "",
        checkSsl: false,
      },
      order: 0,
    },
  });

  const healthCheckEnabled = form.watch("healthCheckEnabled");

  useEffect(() => {
    if (bookmark) {
      form.reset({
        name: bookmark.name,
        description: bookmark.description || "",
        url: bookmark.url,
        icon: bookmark.icon,
        color: bookmark.color || "default",
        categoryId: bookmark.categoryId,
        healthCheckEnabled: bookmark.healthCheckEnabled,
        healthCheckConfig: {
          url: bookmark.healthCheckConfig?.url || "",
          expectedStatus: bookmark.healthCheckConfig?.expectedStatus || 200,
          jsonKey: bookmark.healthCheckConfig?.jsonKey || "",
          jsonValue: bookmark.healthCheckConfig?.jsonValue || "",
          checkSsl: bookmark.healthCheckConfig?.checkSsl || false,
        },
        order: bookmark.order,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        url: "",
        icon: "Globe",
        color: "default",
        categoryId: categories[0]?.id || "",
        healthCheckEnabled: false,
        healthCheckConfig: {
          url: "",
          expectedStatus: 200,
          jsonKey: "",
          jsonValue: "",
          checkSsl: false,
        },
        order: 0,
      });
    }
  }, [bookmark, categories, form]);

  const handleSubmit = (data: FormValues) => {
    const cleanedConfig: HealthCheckConfig | undefined = data.healthCheckEnabled ? {
      url: data.healthCheckConfig?.url || undefined,
      expectedStatus: data.healthCheckConfig?.expectedStatus || 200,
      jsonKey: data.healthCheckConfig?.jsonKey || undefined,
      jsonValue: data.healthCheckConfig?.jsonValue || undefined,
      checkSsl: data.healthCheckConfig?.checkSsl || false,
    } : undefined;
    
    onSubmit({
      ...data,
      healthCheckConfig: cleanedConfig,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="text-bookmark-modal-title">
            {bookmark ? "Edit Bookmark" : "Add Bookmark"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="My Bookmark"
                      {...field}
                      data-testid="input-bookmark-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com"
                      {...field}
                      data-testid="input-bookmark-url"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief description..."
                      className="resize-none"
                      {...field}
                      data-testid="input-bookmark-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <IconPicker value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-bookmark-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id}
                            data-testid={`option-category-${category.id}`}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Style</FormLabel>
                  <FormControl>
                    <ColorPicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="healthCheckEnabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Health Check</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Monitor if the service is accessible
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-health-check"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {healthCheckEnabled && (
              <Collapsible defaultOpen={!!bookmark?.healthCheckConfig?.url}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between" type="button">
                    <span className="text-sm font-medium">Advanced Health Check Options</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 pt-2">
                  <FormField
                    control={form.control}
                    name="healthCheckConfig.url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Endpoint (optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/api/health"
                            {...field}
                            data-testid="input-health-url"
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Leave empty to use the bookmark URL
                        </p>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="healthCheckConfig.expectedStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Status Code</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="200"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 200)}
                            data-testid="input-health-status"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="healthCheckConfig.jsonKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>JSON Key (optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="success"
                              {...field}
                              data-testid="input-health-json-key"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="healthCheckConfig.jsonValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Value (optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="OK"
                              {...field}
                              data-testid="input-health-json-value"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Check if the response contains a specific JSON key/value pair
                  </p>

                  <FormField
                    control={form.control}
                    name="healthCheckConfig.checkSsl"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 pt-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-check-ssl"
                          />
                        </FormControl>
                        <div className="space-y-0.5">
                          <FormLabel className="!mt-0">Check SSL Certificate</FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Verify the SSL certificate is valid and not expired
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </CollapsibleContent>
              </Collapsible>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-bookmark"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                data-testid="button-save-bookmark"
              >
                {isPending ? "Saving..." : bookmark ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
