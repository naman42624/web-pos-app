import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo.js";
import authRoutes from "./routes/auth.js";
import dataRoutes from "./routes/data.js";
import usersRoutes from "./routes/users.js";
import rolesRoutes from "./routes/roles.js";
import { connectDB, getDBConnectionStatus, initializeIndexes } from "./db/connection.js";
import { ensureSuperAdminExists } from "./scripts/createSuperAdmin.js";
import { dbHealthCheck } from "./middleware/dbHealthCheck.js";

let dbConnected = false;

// Call this function from node-build.ts BEFORE creating server
export async function initializeDB() {
  try {
    console.log("[Server] Starting database initialization...");

    // Connect to MongoDB with retries
    await connectDB();
    console.log("[Server] ✓ Connected to MongoDB");

    // Create database indexes for performance
    await initializeIndexes();
    console.log("[Server] ✓ Database indexes created");

    // Initialize admin user if not exists
    await ensureSuperAdminExists();
    console.log("[Server] ✓ Super admin initialized");

    dbConnected = true;
    console.log("[Server] ✅ Database initialization complete");
  } catch (error: any) {
    console.error("[Server] ❌ Failed to initialize database:", error.message);
    throw error; // This will prevent the app from starting
  }
}

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Response time monitoring middleware
  app.use((req, res, next) => {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const level = duration > 1000 ? 'SLOW' : duration > 500 ? 'WARN' : 'INFO';
      console.log(`[${level}] [${requestId}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    });

    next();
  });

  // Heroku deployment: Routes are prefixed with /api for consistent client-server communication
  // Note: Database is already initialized by initializeDB() in node-build.ts before this server is created

  // Example API routes
  app.get("/ping", (_req: Request, res: Response) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/demo", handleDemo);

  // Routes are mounted WITHOUT /api prefix here because:
  // - In Vite dev: express app is mounted at /api, so paths don't include it
  // - In production: node-build.ts mounts this app at /api

  // Authentication routes
  app.use("/auth", authRoutes);

  // User management routes
  app.use("/users", usersRoutes);

  // Role management routes
  app.use("/roles", rolesRoutes);

  // POS data routes (with built-in retry logic for database operations)
  app.use("/data", dataRoutes);

  // API 404 handler - returns JSON for unmatched API routes
  // This prevents falling through to Vite's SPA fallback middleware in dev
  app.use((req: Request, res: Response) => {
    console.log(`API route not found: ${req.method} ${req.path}`);
    res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.path}` });
  });

  // Global error handler
  app.use(
    (
      err: any,
      _req: Request,
      res: Response,
      _next: NextFunction,
    ) => {
      console.error("Unhandled error:", err);
      res.status(500).json({ error: "Internal server error" });
    },
  );

  return app;
}
