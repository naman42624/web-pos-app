#!/usr/bin/env node
/**
 * Production server startup script
 * Runs the pre-built server bundle
 * Ensures proper error handling and logging
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, 'dist/server/node-build.mjs');
const spaPath = path.join(__dirname, 'dist/spa/index.html');

console.log(`\n╔════════════════════════════════════════════════╗`);
console.log(`║   POS App - Production Server Startup         ║`);
console.log(`╚════════════════════════════════════════════════╝\n`);

console.log(`📦 Configuration:`);
console.log(`   Environment: ${process.env.NODE_ENV || 'production'}`);
console.log(`   Port: ${process.env.PORT || 8080}`);
console.log(`   MongoDB: ${process.env.MONGODB_URL ? '✓ Configured' : '⚠️  Not set (will attempt to connect anyway)'}\n`);

// Check if SPA build exists
if (!existsSync(spaPath)) {
  console.error(`\n❌ FATAL: Frontend build not found!`);
  console.error(`   Expected: ${spaPath}`);
  console.error(`   This means 'npm run build' hasn't been run yet.\n`);
  process.exit(1);
}
console.log(`✓ Frontend: dist/spa/index.html exists`);

// Check if server build exists
if (!existsSync(distPath)) {
  console.error(`\n❌ FATAL: Server build not found!`);
  console.error(`   Expected: ${distPath}`);
  console.error(`   This means 'npm run build' hasn't been run yet.\n`);
  process.exit(1);
}
console.log(`✓ Server: dist/server/node-build.mjs exists\n`);

console.log(`🚀 Loading and starting server...\n`);

try {
  // Dynamically import the server module
  const serverModule = await import(`file://${distPath}`);

  console.log(`\n✅ Server module loaded successfully`);
  console.log(`   Server should now be listening on port ${process.env.PORT || 8080}\n`);

  // Keep the process alive
  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM - graceful shutdown');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT - graceful shutdown');
    process.exit(0);
  });

} catch (error) {
  console.error(`\n❌ FATAL: Failed to start server\n`);
  console.error(`Error Name: ${error.name}`);
  console.error(`Error Message: ${error.message}\n`);

  if (error.stack) {
    console.error(`Stack Trace:`);
    console.error(error.stack);
  }

  console.error(`\n💡 Troubleshooting:`);
  console.error(`   1. Check if MongoDB connection string is valid`);
  console.error(`   2. Ensure environment variables are set (MONGODB_URL)`);
  console.error(`   3. Check Fly.dev logs for more details\n`);

  process.exit(1);
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('\n🔥 Uncaught Exception:');
  console.error(error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n🔥 Unhandled Rejection:');
  console.error('Promise:', promise);
  console.error('Reason:', reason);
  process.exit(1);
});
