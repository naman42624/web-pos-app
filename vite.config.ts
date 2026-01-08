import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

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
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();

      // Return a post-hook that runs after Vite's internal middlewares
      return () => {
        // Mount Express app AFTER Vite's middlewares so Vite can serve HTML first
        server.middlewares.use((req, res, next) => {
          // For API routes, use Express
          if (req.url.startsWith("/api")) {
            return app(req, res, next);
          }
          // For everything else (SPA routes), let Vite handle it
          next();
        });
      };
    },
  };
}
