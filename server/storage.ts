import { 
  type Category, type InsertCategory,
  type Bookmark, type InsertBookmark,
  type ApiCall, type InsertApiCall,
  type User, type InsertUser
} from "@shared/schema";
import { randomUUID } from "crypto";

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
  updateBookmarkHealth(id: string, status: "online" | "offline" | "unknown"): Promise<Bookmark | undefined>;
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
}

export class MemStorage implements IStorage {
  private categories: Map<string, Category>;
  private bookmarks: Map<string, Bookmark>;
  private apiCalls: Map<string, ApiCall>;
  private users: Map<string, User>;

  constructor() {
    this.categories = new Map();
    this.bookmarks = new Map();
    this.apiCalls = new Map();
    this.users = new Map();

    const defaultCategory: Category = {
      id: randomUUID(),
      name: "General",
      order: 0,
    };
    this.categories.set(defaultCategory.id, defaultCategory);
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
    return category;
  }

  async updateCategory(id: string, updates: Partial<InsertCategory>): Promise<Category | undefined> {
    const existing = this.categories.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.categories.delete(id);
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
    };
    this.bookmarks.set(id, bookmark);
    return bookmark;
  }

  async updateBookmark(id: string, updates: Partial<InsertBookmark>): Promise<Bookmark | undefined> {
    const existing = this.bookmarks.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.bookmarks.set(id, updated);
    return updated;
  }

  async updateBookmarkHealth(id: string, status: "online" | "offline" | "unknown"): Promise<Bookmark | undefined> {
    const existing = this.bookmarks.get(id);
    if (!existing) return undefined;
    const updated = {
      ...existing,
      healthStatus: status,
      lastHealthCheck: new Date().toISOString(),
    };
    this.bookmarks.set(id, updated);
    return updated;
  }

  async deleteBookmark(id: string): Promise<boolean> {
    return this.bookmarks.delete(id);
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
    return apiCall;
  }

  async updateApiCall(id: string, updates: Partial<InsertApiCall>): Promise<ApiCall | undefined> {
    const existing = this.apiCalls.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.apiCalls.set(id, updated);
    return updated;
  }

  async deleteApiCall(id: string): Promise<boolean> {
    return this.apiCalls.delete(id);
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
    return user;
  }
}

export const storage = new MemStorage();
