import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import authRoutes from "./routes/auth";
import dataRoutes from "./routes/data";
import { connectDB } from "./db/connection";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize database connection
  connectDB().catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.use("/api/auth", authRoutes);

  // Data routes (with authentication)
  app.use("/api/data", dataRoutes);

  return app;
}
