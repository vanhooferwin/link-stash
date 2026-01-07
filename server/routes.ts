import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCategorySchema, insertBookmarkSchema, insertApiCallSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const data = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(data);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create category" });
      }
    }
  });

  app.patch("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, data);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update category" });
      }
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCategory(id);
      if (!deleted) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // Bookmarks
  app.get("/api/bookmarks", async (req, res) => {
    try {
      const bookmarks = await storage.getBookmarks();
      res.json(bookmarks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookmarks" });
    }
  });

  app.get("/api/bookmarks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const bookmark = await storage.getBookmark(id);
      if (!bookmark) {
        return res.status(404).json({ error: "Bookmark not found" });
      }
      res.json(bookmark);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookmark" });
    }
  });

  app.post("/api/bookmarks", async (req, res) => {
    try {
      const data = insertBookmarkSchema.parse(req.body);
      const bookmark = await storage.createBookmark(data);
      res.status(201).json(bookmark);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create bookmark" });
      }
    }
  });

  app.patch("/api/bookmarks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertBookmarkSchema.partial().parse(req.body);
      const bookmark = await storage.updateBookmark(id, data);
      if (!bookmark) {
        return res.status(404).json({ error: "Bookmark not found" });
      }
      res.json(bookmark);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update bookmark" });
      }
    }
  });

  app.delete("/api/bookmarks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteBookmark(id);
      if (!deleted) {
        return res.status(404).json({ error: "Bookmark not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete bookmark" });
    }
  });

  app.post("/api/bookmarks/:id/health", async (req, res) => {
    try {
      const { id } = req.params;
      const bookmark = await storage.getBookmark(id);
      if (!bookmark) {
        return res.status(404).json({ error: "Bookmark not found" });
      }

      let status: "online" | "offline" = "offline";
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(bookmark.url, {
          method: "HEAD",
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        
        status = response.ok ? "online" : "offline";
      } catch {
        status = "offline";
      }

      const updated = await storage.updateBookmarkHealth(id, status);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to check health" });
    }
  });

  // API Calls
  app.get("/api/api-calls", async (req, res) => {
    try {
      const apiCalls = await storage.getApiCalls();
      res.json(apiCalls);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch API calls" });
    }
  });

  app.get("/api/api-calls/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const apiCall = await storage.getApiCall(id);
      if (!apiCall) {
        return res.status(404).json({ error: "API call not found" });
      }
      res.json(apiCall);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch API call" });
    }
  });

  app.post("/api/api-calls", async (req, res) => {
    try {
      const data = insertApiCallSchema.parse(req.body);
      const apiCall = await storage.createApiCall(data);
      res.status(201).json(apiCall);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create API call" });
      }
    }
  });

  app.patch("/api/api-calls/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertApiCallSchema.partial().parse(req.body);
      const apiCall = await storage.updateApiCall(id, data);
      if (!apiCall) {
        return res.status(404).json({ error: "API call not found" });
      }
      res.json(apiCall);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update API call" });
      }
    }
  });

  app.delete("/api/api-calls/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteApiCall(id);
      if (!deleted) {
        return res.status(404).json({ error: "API call not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete API call" });
    }
  });

  app.post("/api/api-calls/:id/execute", async (req, res) => {
    try {
      const { id } = req.params;
      const apiCall = await storage.getApiCall(id);
      if (!apiCall) {
        return res.status(404).json({ error: "API call not found" });
      }

      const startTime = Date.now();
      
      const fetchOptions: RequestInit = {
        method: apiCall.method,
        headers: {
          "Content-Type": "application/json",
          ...apiCall.headers,
        },
      };

      if (apiCall.body && apiCall.method !== "GET") {
        fetchOptions.body = apiCall.body;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      try {
        const response = await fetch(apiCall.url, {
          ...fetchOptions,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        
        const duration = Date.now() - startTime;
        const bodyText = await response.text();
        
        const headers: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          headers[key] = value;
        });

        res.json({
          status: response.status,
          statusText: response.statusText,
          headers,
          body: bodyText,
          duration,
          timestamp: new Date().toISOString(),
        });
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;
        
        if (fetchError.name === "AbortError") {
          res.json({
            status: 0,
            statusText: "Request Timeout",
            headers: {},
            body: "Request timed out after 30 seconds",
            duration,
            timestamp: new Date().toISOString(),
          });
        } else {
          res.json({
            status: 0,
            statusText: "Network Error",
            headers: {},
            body: fetchError.message || "Failed to connect to the server",
            duration,
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to execute API call" });
    }
  });

  // Health check ping endpoint
  app.get("/api/health/ping", async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL is required" });
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(url, {
        method: "HEAD",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      res.json({
        status: response.ok ? "online" : "offline",
        statusCode: response.status,
      });
    } catch {
      res.json({ status: "offline", statusCode: 0 });
    }
  });

  return httpServer;
}
