import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve",
    async configureServer(server) {
      const { createServer } = await import("./server/index.js");
      const app = createServer();

      // Mount Express app on /api prefix FIRST, before other middlewares
      server.middlewares.use("/api", app);

      // Return a post hook for SPA fallback
      return () => {
        // SPA fallback: for non-API routes that don't exist, serve index.html
        server.middlewares.use((req, res, next) => {
          // Skip API routes (they're handled above)
          if (req.url.startsWith("/api")) {
            return next();
          }
          // For other routes, let Vite's default handling take care of it
          next();
        });
      };
    },
  };
}
