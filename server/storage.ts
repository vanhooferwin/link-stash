import { 
  type Category, type InsertCategory,
  type Bookmark, type InsertBookmark,
  type ApiCall, type InsertApiCall,
  type User, type InsertUser,
  type Settings
} from "@shared/schema";
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as yaml from "js-yaml";
import * as path from "path";

export interface IStorage {
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  getBookmarks(): Promise<Bookmark[]>;
  getBookmarksByCategory(categoryId: string): Promise<Bookmark[]>;
  getBookmark(id: string): Promise<Bookmark | undefined>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  updateBookmark(id: string, bookmark: Partial<InsertBookmark>): Promise<Bookmark | undefined>;
  updateBookmarkHealth(id: string, status: "online" | "offline" | "unknown", sslExpiryDays?: number | null): Promise<Bookmark | undefined>;
  deleteBookmark(id: string): Promise<boolean>;

  getApiCalls(): Promise<ApiCall[]>;
  getApiCallsByCategory(categoryId: string): Promise<ApiCall[]>;
  getApiCall(id: string): Promise<ApiCall | undefined>;
  createApiCall(apiCall: InsertApiCall): Promise<ApiCall>;
  updateApiCall(id: string, apiCall: Partial<InsertApiCall>): Promise<ApiCall | undefined>;
  deleteApiCall(id: string): Promise<boolean>;

  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  exportData(): Promise<string>;
  importData(yamlContent: string): Promise<void>;

  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<Settings>): Promise<Settings>;
}

interface YamlData {
  categories: Category[];
  bookmarks: Bookmark[];
  apiCalls: ApiCall[];
  users: User[];
  settings?: Settings;
}

const DATA_DIR = process.env.DATA_DIR || "./data";
const YAML_FILE = path.join(DATA_DIR, "bookmarks.yaml");

export class YamlStorage implements IStorage {
  private categories: Map<string, Category>;
  private bookmarks: Map<string, Bookmark>;
  private apiCalls: Map<string, ApiCall>;
  private users: Map<string, User>;
  private settings: Settings;

  constructor() {
    this.categories = new Map();
    this.bookmarks = new Map();
    this.apiCalls = new Map();
    this.users = new Map();
    this.settings = {};
    this.loadFromFile();
  }

  private loadFromFile(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(YAML_FILE)) {
        const fileContent = fs.readFileSync(YAML_FILE, "utf8");
        const data = yaml.load(fileContent) as YamlData | null;
        
        if (data) {
          if (data.categories) {
            data.categories.forEach(cat => this.categories.set(cat.id, cat));
          }
          if (data.bookmarks) {
            data.bookmarks.forEach(bm => this.bookmarks.set(bm.id, bm));
          }
          if (data.apiCalls) {
            data.apiCalls.forEach(ac => this.apiCalls.set(ac.id, ac));
          }
          if (data.users) {
            data.users.forEach(user => this.users.set(user.id, user));
          }
          if (data.settings) {
            this.settings = data.settings;
          }
        }
      }

      if (this.categories.size === 0) {
        const defaultCategory: Category = {
          id: randomUUID(),
          name: "General",
          order: 0,
        };
        this.categories.set(defaultCategory.id, defaultCategory);
        this.saveToFile();
      }
    } catch (error) {
      console.error("Error loading YAML file:", error);
      const defaultCategory: Category = {
        id: randomUUID(),
        name: "General",
        order: 0,
      };
      this.categories.set(defaultCategory.id, defaultCategory);
    }
  }

  private saveToFile(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      const data: YamlData = {
        categories: Array.from(this.categories.values()),
        bookmarks: Array.from(this.bookmarks.values()),
        apiCalls: Array.from(this.apiCalls.values()),
        users: Array.from(this.users.values()),
        settings: this.settings,
      };

      const yamlContent = yaml.dump(data, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        sortKeys: false,
      });

      fs.writeFileSync(YAML_FILE, yamlContent, "utf8");
    } catch (error) {
      console.error("Error saving YAML file:", error);
    }
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).sort((a, b) => a.order - b.order);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    this.saveToFile();
    return category;
  }

  async updateCategory(id: string, updates: Partial<InsertCategory>): Promise<Category | undefined> {
    const existing = this.categories.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.categories.set(id, updated);
    this.saveToFile();
    return updated;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = this.categories.delete(id);
    if (result) this.saveToFile();
    return result;
  }

  async getBookmarks(): Promise<Bookmark[]> {
    return Array.from(this.bookmarks.values()).sort((a, b) => a.order - b.order);
  }

  async getBookmarksByCategory(categoryId: string): Promise<Bookmark[]> {
    return Array.from(this.bookmarks.values())
      .filter(b => b.categoryId === categoryId)
      .sort((a, b) => a.order - b.order);
  }

  async getBookmark(id: string): Promise<Bookmark | undefined> {
    return this.bookmarks.get(id);
  }

  async createBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    const id = randomUUID();
    const bookmark: Bookmark = {
      ...insertBookmark,
      id,
      healthStatus: "unknown",
      lastHealthCheck: null,
      sslExpiryDays: null,
    };
    this.bookmarks.set(id, bookmark);
    this.saveToFile();
    return bookmark;
  }

  async updateBookmark(id: string, updates: Partial<InsertBookmark>): Promise<Bookmark | undefined> {
    const existing = this.bookmarks.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.bookmarks.set(id, updated);
    this.saveToFile();
    return updated;
  }

  async updateBookmarkHealth(id: string, status: "online" | "offline" | "unknown", sslExpiryDays?: number | null): Promise<Bookmark | undefined> {
    const existing = this.bookmarks.get(id);
    if (!existing) return undefined;
    const updated = {
      ...existing,
      healthStatus: status,
      lastHealthCheck: new Date().toISOString(),
      sslExpiryDays: sslExpiryDays !== undefined ? sslExpiryDays : existing.sslExpiryDays,
    };
    this.bookmarks.set(id, updated);
    this.saveToFile();
    return updated;
  }

  async deleteBookmark(id: string): Promise<boolean> {
    const result = this.bookmarks.delete(id);
    if (result) this.saveToFile();
    return result;
  }

  async getApiCalls(): Promise<ApiCall[]> {
    return Array.from(this.apiCalls.values()).sort((a, b) => a.order - b.order);
  }

  async getApiCallsByCategory(categoryId: string): Promise<ApiCall[]> {
    return Array.from(this.apiCalls.values())
      .filter(a => a.categoryId === categoryId)
      .sort((a, b) => a.order - b.order);
  }

  async getApiCall(id: string): Promise<ApiCall | undefined> {
    return this.apiCalls.get(id);
  }

  async createApiCall(insertApiCall: InsertApiCall): Promise<ApiCall> {
    const id = randomUUID();
    const apiCall: ApiCall = { ...insertApiCall, id };
    this.apiCalls.set(id, apiCall);
    this.saveToFile();
    return apiCall;
  }

  async updateApiCall(id: string, updates: Partial<InsertApiCall>): Promise<ApiCall | undefined> {
    const existing = this.apiCalls.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.apiCalls.set(id, updated);
    this.saveToFile();
    return updated;
  }

  async deleteApiCall(id: string): Promise<boolean> {
    const result = this.apiCalls.delete(id);
    if (result) this.saveToFile();
    return result;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    this.saveToFile();
    return user;
  }

  async exportData(): Promise<string> {
    const data = {
      categories: Array.from(this.categories.values()),
      bookmarks: Array.from(this.bookmarks.values()),
      apiCalls: Array.from(this.apiCalls.values()),
      settings: this.settings,
    };
    return yaml.dump(data, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
    });
  }

  async importData(yamlContent: string): Promise<void> {
    const data = yaml.load(yamlContent) as Partial<YamlData> | null;
    if (!data) {
      throw new Error("Invalid YAML content");
    }

    this.categories.clear();
    this.bookmarks.clear();
    this.apiCalls.clear();

    if (data.categories) {
      data.categories.forEach(cat => this.categories.set(cat.id, cat));
    }
    if (data.bookmarks) {
      data.bookmarks.forEach(bm => this.bookmarks.set(bm.id, bm));
    }
    if (data.apiCalls) {
      data.apiCalls.forEach(ac => this.apiCalls.set(ac.id, ac));
    }

    if (this.categories.size === 0) {
      const defaultCategory: Category = {
        id: randomUUID(),
        name: "General",
        order: 0,
      };
      this.categories.set(defaultCategory.id, defaultCategory);
    }

    // Import settings if present
    if (data.settings) {
      this.settings = { ...this.settings, ...data.settings };
    }

    this.saveToFile();
  }

  async getSettings(): Promise<Settings> {
    return this.settings;
  }

  async updateSettings(updates: Partial<Settings>): Promise<Settings> {
    // Handle null or empty string values to clear properties
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        delete (this.settings as Record<string, unknown>)[key];
      } else {
        (this.settings as Record<string, unknown>)[key] = value;
      }
    }
    this.saveToFile();
    return this.settings;
  }
}

export const storage = new YamlStorage();
