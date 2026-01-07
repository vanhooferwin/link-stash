import { z } from "zod";

export const AVAILABLE_ICONS = [
  "Globe", "Home", "Star", "Heart", "Bookmark", "Folder", "File", "Code",
  "Terminal", "Database", "Server", "Cloud", "Monitor", "Smartphone", "Laptop",
  "Wifi", "Lock", "Key", "Shield", "Settings", "Cog", "Tool", "Wrench",
  "Hammer", "Zap", "Lightning", "Flame", "Sun", "Moon", "CloudSun",
  "Music", "Video", "Image", "Camera", "Mic", "Headphones", "Speaker",
  "Mail", "MessageSquare", "Send", "Inbox", "Bell", "Calendar", "Clock",
  "MapPin", "Navigation", "Compass", "Map", "Users", "User", "UserPlus",
  "Building", "Store", "ShoppingCart", "CreditCard", "DollarSign", "Wallet",
  "TrendingUp", "BarChart", "PieChart", "Activity", "Target", "Award",
  "Gift", "Package", "Truck", "Plane", "Car", "Bike", "Train",
  "Coffee", "Utensils", "Pizza", "Apple", "Leaf", "Tree", "Flower",
  "Book", "Newspaper", "FileText", "ClipboardList", "CheckSquare", "List",
  "Grid", "Layers", "Box", "Cube", "Hexagon", "Circle", "Square", "Triangle",
  "Link", "ExternalLink", "Share", "Download", "Upload", "Refresh", "Search",
  "Eye", "EyeOff", "Edit", "Trash", "Plus", "Minus", "X", "Check",
  "Github", "Gitlab", "Twitter", "Linkedin", "Facebook", "Instagram", "Youtube"
] as const;

export type IconName = typeof AVAILABLE_ICONS[number];

export const CARD_COLORS = [
  { id: "default", name: "Default", bg: "", border: "" },
  { id: "blue", name: "Blue", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800" },
  { id: "green", name: "Green", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800" },
  { id: "purple", name: "Purple", bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200 dark:border-purple-800" },
  { id: "orange", name: "Orange", bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800" },
  { id: "pink", name: "Pink", bg: "bg-pink-50 dark:bg-pink-950/30", border: "border-pink-200 dark:border-pink-800" },
  { id: "cyan", name: "Cyan", bg: "bg-cyan-50 dark:bg-cyan-950/30", border: "border-cyan-200 dark:border-cyan-800" },
  { id: "yellow", name: "Yellow", bg: "bg-yellow-50 dark:bg-yellow-950/30", border: "border-yellow-200 dark:border-yellow-800" },
  { id: "red", name: "Red", bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800" },
] as const;

export type CardColorId = typeof CARD_COLORS[number]["id"];

export const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;
export type HttpMethod = typeof HTTP_METHODS[number];

export const categorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  order: z.number().default(0),
});

export const insertCategorySchema = categorySchema.omit({ id: true });
export type Category = z.infer<typeof categorySchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export const bookmarkSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  url: z.string().url("Must be a valid URL"),
  icon: z.string().default("Globe"),
  color: z.string().default("default"),
  categoryId: z.string(),
  healthCheckEnabled: z.boolean().default(false),
  healthStatus: z.enum(["online", "offline", "unknown"]).default("unknown"),
  lastHealthCheck: z.string().nullable().default(null),
  order: z.number().default(0),
});

export const insertBookmarkSchema = bookmarkSchema.omit({ id: true, healthStatus: true, lastHealthCheck: true });
export type Bookmark = z.infer<typeof bookmarkSchema>;
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;

export const apiCallSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  url: z.string().url("Must be a valid URL"),
  method: z.enum(HTTP_METHODS).default("GET"),
  headers: z.record(z.string()).optional(),
  body: z.string().optional(),
  categoryId: z.string(),
  icon: z.string().default("Zap"),
  order: z.number().default(0),
});

export const insertApiCallSchema = apiCallSchema.omit({ id: true });
export type ApiCall = z.infer<typeof apiCallSchema>;
export type InsertApiCall = z.infer<typeof insertApiCallSchema>;

export const apiResponseSchema = z.object({
  status: z.number(),
  statusText: z.string(),
  headers: z.record(z.string()),
  body: z.string(),
  duration: z.number(),
  timestamp: z.string(),
});

export type ApiResponse = z.infer<typeof apiResponseSchema>;

export const users = {} as any;
export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = { id: string; username: string; password: string };
