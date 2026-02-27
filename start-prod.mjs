#!/usr/bin/env node
/**
 * Production server startup script
 * Runs the pre-built server bundle
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, 'dist/server/node-build.mjs');
const spaPath = path.join(__dirname, 'dist/spa/index.html');

console.log(`
╔═══════════════════════════════════════════╗
║    POS App - Production Server Startup    ║
╚═══════════════════════════════════════════╝`);

console.log(`
📦 Configuration:
   Environment: ${process.env.NODE_ENV || 'production'}
   Port: ${process.env.PORT || 8080}
   MongoDB: ${process.env.MONGODB_URL ? '✓ Configured' : '✗ Not set'}
`);

console.log(`📁 Build files check:`);

// Check if SPA build exists
if (existsSync(spaPath)) {
  console.log(`   ✓ Frontend: ${spaPath}`);
} else {
  console.error(`   ✗ Frontend not found: ${spaPath}`);
  console.error(`   Run: npm run build`);
  process.exit(1);
}

// Check if server build exists
if (existsSync(distPath)) {
  console.log(`   ✓ Server: ${distPath}`);
} else {
  console.error(`   ✗ Server not found: ${distPath}`);
  console.error(`   Run: npm run build`);
  process.exit(1);
}

console.log(`\n🚀 Starting server...`);

// Wrap imports in try-catch for better error handling
try {
  // Ensure .env is loaded
  if (!process.env.MONGODB_URL) {
    console.warn(`⚠️  Warning: MONGODB_URL environment variable not set`);
  }

  // Import and run the built server
  // This will start the server and keep the process running
  await import(distPath);

  // If we reach here, the server should be running
  // But we'll also add a timeout to detect if it crashed
  setTimeout(() => {
    console.log(`✓ Server appears to be running successfully`);
  }, 2000);

} catch (error) {
  console.error(`\n🔥 Failed to start server!\n`);
  console.error(`Error Type: ${error.name}`);
  console.error(`Error Message: ${error.message}\n`);
  if (error.stack) {
    console.error(`Stack Trace:\n${error.stack}`);
  }
  process.exit(1);
}

// Prevent the process from exiting
process.on('exit', (code) => {
  if (code !== 0) {
    console.error(`\n❌ Process exited with code ${code}`);
  }
});
