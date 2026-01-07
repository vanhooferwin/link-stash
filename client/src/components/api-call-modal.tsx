import { useEffect, useState } from "react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconPicker } from "./icon-picker";
import { ColorPicker } from "./color-picker";
import { Plus, Trash2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApiCall, Category, HttpMethod } from "@shared/schema";
import { HTTP_METHODS } from "@shared/schema";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  url: z.string().url("Must be a valid URL"),
  method: z.enum(HTTP_METHODS).default("GET"),
  headers: z.record(z.string()).optional(),
  body: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  icon: z.string().default("Zap"),
  color: z.string().default("default"),
  order: z.number().default(0),
  responseValidationEnabled: z.boolean().default(false),
  responseValidationConfig: z.object({
    expectedStatus: z.number().default(200),
    jsonKey: z.string().optional(),
    jsonValue: z.string().optional(),
  }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ApiCallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiCall?: ApiCall | null;
  categories: Category[];
  onSubmit: (data: FormValues) => void;
  isPending?: boolean;
}

export function ApiCallModal({
  open,
  onOpenChange,
  apiCall,
  categories,
  onSubmit,
  isPending = false,
}: ApiCallModalProps) {
  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>([]);
  const [validationOpen, setValidationOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      url: "",
      method: "GET",
      headers: {},
      body: "",
      categoryId: categories[0]?.id || "",
      icon: "Zap",
      color: "default",
      order: 0,
      responseValidationEnabled: false,
      responseValidationConfig: {
        expectedStatus: 200,
        jsonKey: "",
        jsonValue: "",
      },
    },
  });

  const method = form.watch("method");
  const showBody = method !== "GET";
  const responseValidationEnabled = form.watch("responseValidationEnabled");

  useEffect(() => {
    if (apiCall) {
      const headerEntries = Object.entries(apiCall.headers || {}).map(([key, value]) => ({
        key,
        value,
      }));
      setHeaders(headerEntries.length > 0 ? headerEntries : []);
      setValidationOpen(apiCall.responseValidationEnabled || false);
      form.reset({
        name: apiCall.name,
        description: apiCall.description || "",
        url: apiCall.url,
        method: apiCall.method,
        headers: apiCall.headers || {},
        body: apiCall.body || "",
        categoryId: apiCall.categoryId,
        icon: apiCall.icon,
        color: apiCall.color || "default",
        order: apiCall.order,
        responseValidationEnabled: apiCall.responseValidationEnabled || false,
        responseValidationConfig: {
          expectedStatus: apiCall.responseValidationConfig?.expectedStatus || 200,
          jsonKey: apiCall.responseValidationConfig?.jsonKey || "",
          jsonValue: apiCall.responseValidationConfig?.jsonValue || "",
        },
      });
    } else {
      setHeaders([]);
      setValidationOpen(false);
      form.reset({
        name: "",
        description: "",
        url: "",
        method: "GET",
        headers: {},
        body: "",
        categoryId: categories[0]?.id || "",
        icon: "Zap",
        color: "default",
        order: 0,
        responseValidationEnabled: false,
        responseValidationConfig: {
          expectedStatus: 200,
          jsonKey: "",
          jsonValue: "",
        },
      });
    }
  }, [apiCall, categories, form]);

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const updateHeader = (index: number, field: "key" | "value", value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const handleSubmit = (data: FormValues) => {
    const headersObj: Record<string, string> = {};
    headers.forEach(({ key, value }) => {
      if (key.trim()) {
        headersObj[key.trim()] = value;
      }
    });
    onSubmit({ ...data, headers: headersObj });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="text-api-call-modal-title">
            {apiCall ? "Edit API Call" : "Add API Call"}
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
                      placeholder="My API Call"
                      {...field}
                      data-testid="input-api-call-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Method</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-api-call-method">
                          <SelectValue placeholder="Method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {HTTP_METHODS.map((method) => (
                          <SelectItem
                            key={method}
                            value={method}
                            data-testid={`option-method-${method.toLowerCase()}`}
                          >
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://api.example.com/endpoint"
                        {...field}
                        data-testid="input-api-call-url"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                      data-testid="input-api-call-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <div className="flex items-center justify-between mb-2">
                <FormLabel>Headers</FormLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addHeader}
                  data-testid="button-add-header"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Header
                </Button>
              </div>
              <div className="space-y-2">
                {headers.map((header, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      placeholder="Key"
                      value={header.key}
                      onChange={(e) => updateHeader(index, "key", e.target.value)}
                      className="flex-1"
                      data-testid={`input-header-key-${index}`}
                    />
                    <Input
                      placeholder="Value"
                      value={header.value}
                      onChange={(e) => updateHeader(index, "value", e.target.value)}
                      className="flex-1"
                      data-testid={`input-header-value-${index}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeHeader(index)}
                      data-testid={`button-remove-header-${index}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {showBody && (
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Request Body (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='{"key": "value"}'
                        className="font-mono text-sm min-h-[100px]"
                        {...field}
                        data-testid="input-api-call-body"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
                        <SelectTrigger data-testid="select-api-call-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id}
                            data-testid={`option-api-category-${category.id}`}
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
              name="responseValidationEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-response-validation"
                    />
                  </FormControl>
                  <FormLabel className="!mt-0 cursor-pointer">
                    Enable response validation (show OK/FAILED toast)
                  </FormLabel>
                </FormItem>
              )}
            />

            {responseValidationEnabled && (
              <Collapsible open={validationOpen} onOpenChange={setValidationOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full justify-between p-2 h-auto text-sm text-muted-foreground"
                    data-testid="button-toggle-validation-options"
                  >
                    <span>Validation Options</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", !validationOpen && "-rotate-90")} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 pt-2">
                  <FormField
                    control={form.control}
                    name="responseValidationConfig.expectedStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Status Code</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="200"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 200)}
                            data-testid="input-expected-status"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="responseValidationConfig.jsonKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>JSON Key (optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., status or data.success"
                            {...field}
                            data-testid="input-json-key"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="responseValidationConfig.jsonValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected JSON Value (optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., ok or true"
                            {...field}
                            data-testid="input-json-value"
                          />
                        </FormControl>
                        <FormMessage />
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
                data-testid="button-cancel-api-call"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                data-testid="button-save-api-call"
              >
                {isPending ? "Saving..." : apiCall ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
