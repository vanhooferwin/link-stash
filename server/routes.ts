import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCategorySchema, insertBookmarkSchema, insertApiCallSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Health check endpoint for Docker
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

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

  app.post("/api/categories/reorder", async (req, res) => {
    try {
      const { ids } = req.body as { ids: string[] };
      if (!Array.isArray(ids)) {
        return res.status(400).json({ error: "ids must be an array" });
      }
      await storage.reorderCategories(ids);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reorder categories" });
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

  app.post("/api/bookmarks/reorder", async (req, res) => {
    try {
      const { ids } = req.body as { ids: string[] };
      if (!Array.isArray(ids)) {
        return res.status(400).json({ error: "ids must be an array" });
      }
      await storage.reorderBookmarks(ids);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reorder bookmarks" });
    }
  });

  app.patch("/api/bookmarks/:id/grid-position", async (req, res) => {
    try {
      const { id } = req.params;
      const { gridRow, gridColumn } = req.body as { gridRow: number; gridColumn: number };
      if (typeof gridRow !== "number" || typeof gridColumn !== "number") {
        return res.status(400).json({ error: "gridRow and gridColumn must be numbers" });
      }
      const bookmark = await storage.updateBookmarkGridPosition(id, gridRow, gridColumn);
      if (!bookmark) {
        return res.status(404).json({ error: "Bookmark not found" });
      }
      res.json(bookmark);
    } catch (error) {
      res.status(500).json({ error: "Failed to update bookmark grid position" });
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
      let sslExpiryDays: number | null = null;
      const config = bookmark.healthCheckConfig;
      const healthUrl = config?.url || bookmark.url;
      const expectedStatus = config?.expectedStatus || 200;
      
      try {
        // Check SSL if enabled
        if (config?.checkSsl) {
          const urlObj = new URL(healthUrl);
          if (urlObj.protocol === "https:") {
            const https = await import("https");
            const sslResult = await new Promise<{ valid: boolean; daysUntilExpiry: number | null }>((resolve) => {
              const req = https.request({
                hostname: urlObj.hostname,
                port: urlObj.port || 443,
                method: "HEAD",
                timeout: 10000,
              }, (response) => {
                const cert = (response.socket as any).getPeerCertificate?.();
                if (cert && cert.valid_to) {
                  const expiryDate = new Date(cert.valid_to);
                  const now = new Date();
                  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  resolve({ valid: expiryDate > now, daysUntilExpiry });
                } else {
                  resolve({ valid: true, daysUntilExpiry: null });
                }
              });
              req.on("error", () => resolve({ valid: false, daysUntilExpiry: null }));
              req.on("timeout", () => {
                req.destroy();
                resolve({ valid: false, daysUntilExpiry: null });
              });
              req.end();
            });
            
            sslExpiryDays = sslResult.daysUntilExpiry;
            
            if (!sslResult.valid) {
              status = "offline";
              const updated = await storage.updateBookmarkHealth(id, status, sslExpiryDays);
              return res.json(updated);
            }
          }
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(healthUrl, {
          method: config?.jsonKey ? "GET" : "HEAD",
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        
        if (response.status !== expectedStatus) {
          status = "offline";
        } else if (config?.jsonKey) {
          try {
            const json = await response.json();
            const value = json[config.jsonKey];
            if (config.jsonValue) {
              status = String(value) === config.jsonValue ? "online" : "offline";
            } else {
              status = value !== undefined ? "online" : "offline";
            }
          } catch {
            status = "offline";
          }
        } else {
          status = "online";
        }
      } catch {
        status = "offline";
      }

      const updated = await storage.updateBookmarkHealth(id, status, sslExpiryDays);
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

  app.post("/api/api-calls/reorder", async (req, res) => {
    try {
      const { ids } = req.body as { ids: string[] };
      if (!Array.isArray(ids)) {
        return res.status(400).json({ error: "ids must be an array" });
      }
      await storage.reorderApiCalls(ids);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reorder API calls" });
    }
  });

  app.patch("/api/api-calls/:id/grid-position", async (req, res) => {
    try {
      const { id } = req.params;
      const { gridRow, gridColumn } = req.body as { gridRow: number; gridColumn: number };
      if (typeof gridRow !== "number" || typeof gridColumn !== "number") {
        return res.status(400).json({ error: "gridRow and gridColumn must be numbers" });
      }
      const apiCall = await storage.updateApiCallGridPosition(id, gridRow, gridColumn);
      if (!apiCall) {
        return res.status(404).json({ error: "API call not found" });
      }
      res.json(apiCall);
    } catch (error) {
      res.status(500).json({ error: "Failed to update API call grid position" });
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

        let validationResult: { passed: boolean; reason?: string } | undefined;
        
        if (apiCall.responseValidationEnabled && apiCall.responseValidationConfig) {
          const config = apiCall.responseValidationConfig;
          const expectedStatus = config.expectedStatus || 200;
          
          if (response.status !== expectedStatus) {
            validationResult = { 
              passed: false, 
              reason: `Expected status ${expectedStatus}, got ${response.status}` 
            };
          } else if (config.jsonKey) {
            try {
              const json = JSON.parse(bodyText);
              const keys = config.jsonKey.split(".");
              let value = json;
              for (const key of keys) {
                value = value?.[key];
              }
              
              if (config.jsonValue) {
                if (String(value) === config.jsonValue) {
                  validationResult = { passed: true };
                } else {
                  validationResult = { 
                    passed: false, 
                    reason: `Expected "${config.jsonKey}" = "${config.jsonValue}", got "${value}"` 
                  };
                }
              } else {
                if (value !== undefined) {
                  validationResult = { passed: true };
                } else {
                  validationResult = { 
                    passed: false, 
                    reason: `Key "${config.jsonKey}" not found in response` 
                  };
                }
              }
            } catch {
              validationResult = { passed: false, reason: "Failed to parse response as JSON" };
            }
          } else {
            validationResult = { passed: true };
          }
        }

        res.json({
          status: response.status,
          statusText: response.statusText,
          headers,
          body: bodyText,
          duration,
          timestamp: new Date().toISOString(),
          validationResult,
        });
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;
        
        const validationResult = apiCall.responseValidationEnabled 
          ? { passed: false, reason: fetchError.name === "AbortError" ? "Request timeout" : "Network error" }
          : undefined;
        
        if (fetchError.name === "AbortError") {
          res.json({
            status: 0,
            statusText: "Request Timeout",
            headers: {},
            body: "Request timed out after 30 seconds",
            duration,
            timestamp: new Date().toISOString(),
            validationResult,
          });
        } else {
          res.json({
            status: 0,
            statusText: "Network Error",
            headers: {},
            body: fetchError.message || "Failed to connect to the server",
            duration,
            timestamp: new Date().toISOString(),
            validationResult,
          });
        }
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to execute API call" });
    }
  });

  // Settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to get settings" });
    }
  });

  app.patch("/api/settings", async (req, res) => {
    try {
      const settings = await storage.updateSettings(req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Export configuration
  app.get("/api/config/export", async (req, res) => {
    try {
      const yamlContent = await storage.exportData();
      res.setHeader("Content-Type", "application/x-yaml");
      res.setHeader("Content-Disposition", "attachment; filename=bookmarks-backup.yaml");
      res.send(yamlContent);
    } catch (error) {
      res.status(500).json({ error: "Failed to export configuration" });
    }
  });

  // Import configuration
  app.post("/api/config/import", async (req, res) => {
    try {
      const yamlContent = req.body.yaml;
      if (!yamlContent || typeof yamlContent !== "string") {
        return res.status(400).json({ error: "YAML content is required" });
      }
      await storage.importData(yamlContent);
      res.json({ success: true, message: "Configuration imported successfully" });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to import configuration" });
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
      const timeoutId = setTimeout(() => controller.abort(), 3005);
      
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
