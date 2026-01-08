import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo.js";
import authRoutes from "./routes/auth.js";
import dataRoutes from "./routes/data.js";
import usersRoutes from "./routes/users.js";
import rolesRoutes from "./routes/roles.js";
import { connectDB } from "./db/connection.js";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });

  // Initialize database connection
  connectDB().catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
  });

  // Example API routes
  app.get("/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/demo", handleDemo);

  // Authentication routes
  app.use("/auth", authRoutes);

  // User management routes
  app.use("/users", usersRoutes);

  // Role management routes
  app.use("/roles", rolesRoutes);

  // POS data routes
  app.use("/data", dataRoutes);

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

  // 404 handler - for non-API routes, let the SPA handle routing
  app.use((_req: express.Request, res: express.Response) => {
    res.status(404).json({ error: "Not found" });
  });

  return app;
}
