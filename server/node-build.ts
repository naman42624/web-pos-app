import path from "path";
import { createServer } from "./index";
import express from "express";

const port = process.env.PORT || 3000;

// In production, serve the built SPA files
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../dist/spa");

// Create wrapper app that mounts API at /api prefix
const mainApp = express();

// Serve static files
mainApp.use(express.static(distPath));

// Health check endpoint (doesn't require DB)
mainApp.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Create the API server
const app = createServer();

// Mount the API app at /api prefix
// (routes inside createServer() don't have /api prefix)
mainApp.use("/api", app);

// Handle React Router - serve index.html for all non-API routes
mainApp.use((req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  // Serve index.html for all other routes (SPA routing)
  const indexPath = path.join(distPath, "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error("Error sending index.html:", err);
      res.status(404).json({ error: "SPA file not found" });
    }
  });
});

// Start server
const server = mainApp.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
  console.log(`💚 Health: http://localhost:${port}/health`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error("🔥 Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("🔥 Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
