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
    "Home", "Star", "Heart", "Bookmark", "File", "FileText", "ClipboardList",
    "Calendar", "Clock", "MapPin", "Navigation", "Compass", "Map",
    "Settings", "Cog", "Wrench", "Hammer", "Tool",
    "Zap", "Flame", "Sun", "Moon", "Coffee",
    "Book", "Newspaper", "List", "Grid", "Search", "Eye", "Edit", "Trash", "Plus", "Check",
    "Download", "Upload", "Refresh", "Package", "Box", "Cube", "Hexagon"
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
});

export type Settings = z.infer<typeof settingsSchema>;

export type SettingsUpdate = {
  backgroundImageUrl?: string | null;
};

export const users = {} as any;
export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = InsertUser & { id: number };
