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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@shared/schema";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  order: z.number().default(0),
  columns: z.number().min(2).max(8).default(4),
});

type FormValues = z.infer<typeof formSchema>;

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  onSubmit: (data: FormValues) => void;
  isPending?: boolean;
}

export function CategoryModal({
  open,
  onOpenChange,
  category,
  onSubmit,
  isPending = false,
}: CategoryModalProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      order: 0,
      columns: 4,
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        order: category.order,
        columns: category.columns ?? 4,
      });
    } else {
      form.reset({
        name: "",
        order: 0,
        columns: 4,
      });
    }
  }, [category, form]);

  const handleSubmit = (data: FormValues) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle data-testid="text-category-modal-title">
            {category ? "Edit Category" : "Add Category"}
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
                      placeholder="Category name"
                      {...field}
                      data-testid="input-category-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="columns"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Columns</FormLabel>
                  <Select
                    value={String(field.value)}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-category-columns">
                        <SelectValue placeholder="Select columns" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <SelectItem key={num} value={String(num)}>
                          {num} columns
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-category"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                data-testid="button-save-category"
              >
                {isPending ? "Saving..." : category ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
