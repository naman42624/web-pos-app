import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo.js";
import authRoutes from "./routes/auth.js";
import dataRoutes from "./routes/data.js";
import usersRoutes from "./routes/users.js";
import rolesRoutes from "./routes/roles.js";
import { connectDB } from "./db/connection.js";
import { ensureSuperAdminExists } from "./scripts/createSuperAdmin.js";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Request logging
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });

  // Heroku deployment: Routes are prefixed with /api for consistent client-server communication

  // Initialize database connection
  connectDB()
    .then(() => {
      ensureSuperAdminExists();
    })
    .catch((error) => {
      console.error("Failed to connect to MongoDB:", error);
    });

  // Example API routes
  app.get("/ping", (_req, res) => {
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

  // POS data routes
  app.use("/data", dataRoutes);

  // API 404 handler - returns JSON for unmatched API routes
  // This prevents falling through to Vite's SPA fallback middleware in dev
  app.use((req: express.Request, res: express.Response) => {
    console.log(`API route not found: ${req.method} ${req.path}`);
    res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.path}` });
  });

  // Global error handler
  app.use(
    (
      err: any,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error("Unhandled error:", err);
      res.status(500).json({ error: "Internal server error" });
    },
  );

  return app;
}
