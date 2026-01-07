import { z } from "zod";

export const ICON_CATEGORIES = {
  "DevOps & CI/CD": [
    "Github", "Gitlab", "Bitbucket", "Jira", "Confluence", "Jenkins", "CircleCi", 
    "TravisCi", "Ansible", "Terraform", "Puppet", "Chef", "ArgoCD", "GitOps",
    "Pipeline", "Workflow", "GitBranch", "GitMerge", "GitPullRequest", "GitCommit"
  ],
  "Cloud & Infrastructure": [
    "Aws", "Azure", "GoogleCloud", "DigitalOcean", "Cloudflare", "Heroku", "Vercel", "Netlify",
    "Cloud", "CloudUpload", "CloudDownload", "Server", "ServerCog", "ServerCrash",
    "Datacenter", "Rack", "Region", "Zone"
  ],
  "Containers & Orchestration": [
    "Docker", "Kubernetes", "Helm", "Container", "Blocks", "Layers",
    "Pod", "Deployment", "Service", "Namespace"
  ],
  "Storage & Databases": [
    "Database", "HardDrive", "Disc", "Archive", "Folder", "FolderOpen", "FolderTree",
    "S3", "Blob", "FileStorage", "ObjectStorage",
    "Mongodb", "Postgresql", "Mysql", "Redis", "Elasticsearch", "Cassandra", "DynamoDB",
    "Vault", "Bucket"
  ],
  "Compute & Processing": [
    "Cpu", "Gpu", "Memory", "Chip", "Circuit", "Processor",
    "Lambda", "Function", "Compute", "Instance", "VirtualMachine"
  ],
  "Network & Security": [
    "Network", "Router", "Wifi", "Globe", "Link", "ExternalLink", "Share",
    "LoadBalancer", "Gateway", "Firewall", "Cdn", "Dns", "Proxy", "Vpn",
    "Lock", "Unlock", "Key", "KeyRound", "Shield", "ShieldCheck", "ShieldAlert",
    "Fingerprint", "Scan", "Bug", "BugOff"
  ],
  "Monitoring & Logging": [
    "Activity", "BarChart", "PieChart", "LineChart", "TrendingUp", "TrendingDown",
    "Grafana", "Prometheus", "Datadog", "Splunk", "Kibana", "Loki",
    "AlertCircle", "AlertTriangle", "Bell", "BellRing", "Gauge", "Meter", "Heartbeat"
  ],
  "Development Tools": [
    "Code", "Terminal", "TerminalSquare", "Braces", "FileCode", "FileJson",
    "Npm", "Yarn", "Pnpm", "Bun",
    "Nodejs", "Python", "Java", "Go", "Rust", "Php", "Ruby", "Dotnet", "Typescript", "Javascript",
    "React", "Vue", "Angular", "Svelte", "Nextjs", "Nuxt",
    "Vscode", "Intellij", "Vim", "Neovim"
  ],
  "Collaboration & Communication": [
    "Slack", "Discord", "Teams", "Zoom", "Meet", "Mattermost",
    "Notion", "Confluence", "Trello", "Asana", "Linear", "Monday",
    "Figma", "Miro", "Airtable",
    "Mail", "MessageSquare", "Send", "Inbox", "Users", "UserPlus"
  ],
  "General": [
    "Home", "Dashboard", "LayoutDashboard", "AppWindow", "Application",
    "Star", "Heart", "Bookmark", "File", "FileText", "ClipboardList",
    "Calendar", "Clock", "MapPin", "Navigation", "Compass", "Map",
    "Settings", "Cog", "Wrench", "Hammer", "Tool",
    "Zap", "Flame", "Sun", "Moon", "Coffee",
    "Book", "Newspaper", "List", "Grid", "Search", "Eye", "Edit", "Trash", "Plus", "Check",
    "Download", "Upload", "Refresh", "Package", "Box", "Cube", "Hexagon",
    "Hand", "Pointer", "MousePointer", "Monitor", "MonitorSmartphone", "Tv", "Tablet", "Smartphone", "Touchscreen", "Nas", "ServerStack",
    "Barco", "Presentation", "Projector", "MonitorPlay"
  ],
  "Payment & Commerce": [
    "Stripe", "Paypal", "Shopify", "CreditCard", "DollarSign", "Wallet",
    "ShoppingCart", "Store", "Building", "Receipt", "Invoice"
  ],
  "Social & Media": [
    "Twitter", "Linkedin", "Facebook", "Instagram", "Youtube", "Tiktok",
    "Spotify", "Netflix", "Twitch", "Steam", "Reddit", "HackerNews",
    "Music", "Video", "Image", "Camera", "Mic", "Headphones"
  ],
  "Storage Services": [
    "GoogleDrive", "OneDrive", "Dropbox", "Box", "Backblaze", "Wasabi", "Minio"
  ]
} as const;

// Flatten all icons into a single array
export const AVAILABLE_ICONS = Object.values(ICON_CATEGORIES).flat();

export type IconName = string;
export type IconCategory = keyof typeof ICON_CATEGORIES;

export const CARD_COLORS = [
  // Solid colors
  { id: "default", name: "Default", bg: "", border: "" },
  { id: "blue", name: "Blue", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800" },
  { id: "green", name: "Green", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800" },
  { id: "purple", name: "Purple", bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200 dark:border-purple-800" },
  { id: "orange", name: "Orange", bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800" },
  { id: "pink", name: "Pink", bg: "bg-pink-50 dark:bg-pink-950/30", border: "border-pink-200 dark:border-pink-800" },
  { id: "cyan", name: "Cyan", bg: "bg-cyan-50 dark:bg-cyan-950/30", border: "border-cyan-200 dark:border-cyan-800" },
  { id: "yellow", name: "Yellow", bg: "bg-yellow-50 dark:bg-yellow-950/30", border: "border-yellow-200 dark:border-yellow-800" },
  { id: "red", name: "Red", bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800" },
  { id: "indigo", name: "Indigo", bg: "bg-indigo-50 dark:bg-indigo-950/30", border: "border-indigo-200 dark:border-indigo-800" },
  { id: "teal", name: "Teal", bg: "bg-teal-50 dark:bg-teal-950/30", border: "border-teal-200 dark:border-teal-800" },
  { id: "lime", name: "Lime", bg: "bg-lime-50 dark:bg-lime-950/30", border: "border-lime-200 dark:border-lime-800" },
  { id: "amber", name: "Amber", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800" },
  { id: "rose", name: "Rose", bg: "bg-rose-50 dark:bg-rose-950/30", border: "border-rose-200 dark:border-rose-800" },
  { id: "slate", name: "Slate", bg: "bg-slate-100 dark:bg-slate-800/30", border: "border-slate-200 dark:border-slate-700" },
  { id: "zinc", name: "Zinc", bg: "bg-zinc-100 dark:bg-zinc-800/30", border: "border-zinc-200 dark:border-zinc-700" },
  // Gradients
  { id: "gradient-blue-purple", name: "Blue to Purple", bg: "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30", border: "border-blue-200 dark:border-purple-800" },
  { id: "gradient-green-teal", name: "Green to Teal", bg: "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30", border: "border-emerald-200 dark:border-teal-800" },
  { id: "gradient-orange-red", name: "Orange to Red", bg: "bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30", border: "border-orange-200 dark:border-red-800" },
  { id: "gradient-pink-purple", name: "Pink to Purple", bg: "bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30", border: "border-pink-200 dark:border-purple-800" },
  { id: "gradient-cyan-blue", name: "Cyan to Blue", bg: "bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30", border: "border-cyan-200 dark:border-blue-800" },
  { id: "gradient-yellow-orange", name: "Yellow to Orange", bg: "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30", border: "border-yellow-200 dark:border-orange-800" },
  { id: "gradient-indigo-pink", name: "Indigo to Pink", bg: "bg-gradient-to-r from-indigo-50 to-pink-50 dark:from-indigo-950/30 dark:to-pink-950/30", border: "border-indigo-200 dark:border-pink-800" },
  { id: "gradient-teal-cyan", name: "Teal to Cyan", bg: "bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30", border: "border-teal-200 dark:border-cyan-800" },
  { id: "gradient-rose-orange", name: "Rose to Orange", bg: "bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-950/30 dark:to-orange-950/30", border: "border-rose-200 dark:border-orange-800" },
  { id: "gradient-purple-blue", name: "Purple to Blue", bg: "bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30", border: "border-purple-200 dark:border-blue-800" },
] as const;

export type CardColorId = typeof CARD_COLORS[number]["id"];

export const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;
export type HttpMethod = typeof HTTP_METHODS[number];

export const responseValidationConfigSchema = z.object({
  expectedStatus: z.number().default(200),
  jsonKey: z.string().optional(),
  jsonValue: z.string().optional(),
});

export type ResponseValidationConfig = z.infer<typeof responseValidationConfigSchema>;

export const categorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  order: z.number().default(0),
  columns: z.number().min(2).max(8).default(4),
});

export const insertCategorySchema = categorySchema.omit({ id: true });
export type Category = z.infer<typeof categorySchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export const healthCheckConfigSchema = z.object({
  url: z.string().optional(),
  expectedStatus: z.number().default(200),
  jsonKey: z.string().optional(),
  jsonValue: z.string().optional(),
  checkSsl: z.boolean().default(false),
});

export type HealthCheckConfig = z.infer<typeof healthCheckConfigSchema>;

export const bookmarkSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  url: z.string().url("Must be a valid URL"),
  icon: z.string().default("Globe"),
  color: z.string().default("default"),
  categoryId: z.string(),
  healthCheckEnabled: z.boolean().default(false),
  healthCheckConfig: healthCheckConfigSchema.optional(),
  healthStatus: z.enum(["online", "offline", "unknown"]).default("unknown"),
  lastHealthCheck: z.string().nullable().default(null),
  sslExpiryDays: z.number().nullable().default(null),
  order: z.number().default(0),
  gridRow: z.number().min(0).optional().default(0),
  gridColumn: z.number().min(0).optional().default(0),
});

export const insertBookmarkSchema = bookmarkSchema.omit({ id: true, healthStatus: true, lastHealthCheck: true, sslExpiryDays: true });
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
  color: z.string().default("default"),
  order: z.number().default(0),
  gridRow: z.number().min(0).optional().default(0),
  gridColumn: z.number().min(0).optional().default(0),
  responseValidationEnabled: z.boolean().default(false),
  responseValidationConfig: responseValidationConfigSchema.optional(),
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

export const settingsSchema = z.object({
  backgroundImageUrl: z.string().optional().nullable(),
  backgroundBrightness: z.number().min(0).max(200).default(100),
  backgroundOpacity: z.number().min(0).max(100).default(100),
  healthCheckInterval: z.number().min(10).max(3600).default(60),
});

export type Settings = z.infer<typeof settingsSchema>;

export type SettingsUpdate = {
  backgroundImageUrl?: string | null;
  backgroundBrightness?: number;
  backgroundOpacity?: number;
  healthCheckInterval?: number;
};

export const users = {} as any;
export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = InsertUser & { id: number };
