import mongoose from "mongoose";

const MONGODB_URL =
  process.env.MONGODB_URL || "mongodb://localhost:27017/pos-system";

// Global connection cache
let cachedConnection: typeof mongoose | null = null;
let isConnecting = false;
let connectionError: Error | null = null;

export async function connectDB() {
  try {
    // If already connected, return immediately (no checks needed)
    if (cachedConnection && mongoose.connection.readyState === 1) {
      console.log("[DB] Using cached MongoDB connection");
      return cachedConnection;
    }

    // Check current connection state
    if (mongoose.connection.readyState === 1) {
      console.log("[DB] MongoDB already connected");
      return mongoose;
    }
    
    console.log("[DB] Connecting to MongoDB...");
    console.log("[DB] MONGODB_URL:", MONGODB_URL.substring(0, 50) + "...");

    await mongoose.connect(MONGODB_URL, {
      // Connection pool settings - pre-establish connections
      maxPoolSize: 30,
      minPoolSize: 10,

      // Timeout settings - give more time for operations
      maxIdleTimeMS: 60000,
      waitQueueTimeoutMS: 30000,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 120000,
      connectTimeoutMS: 30000,
      heartbeatFrequencyMS: 5000,

      // Retry logic - automatically retry failed operations
      retryWrites: true,
      retryReads: true,

      // Write concerns
      w: "majority",

      // Connection monitoring
      monitorCommands: false,

      // Disable buffering for better error handling
      bufferCommands: false,

      // Family - prefer IPv4
      family: 4,
    });

    cachedConnection = mongoose;
    console.log("[DB] MongoDB connected successfully");
    return mongoose;
  } catch (error: any) {
    console.error("[DB] MongoDB connection error:", {
      code: error.code,
      message: error.message,
      name: error.name,
    });
    console.error("[DB] Full error:", error);
    throw error;
  }
}

export async function ensureDBConnected() {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      await connectDB();
      return;
    } catch (error) {
      lastError = error as Error;
      console.warn(`[DB] Connection attempt ${i + 1}/${maxRetries} failed:`, lastError.message);
      if (i < maxRetries - 1) {
        // Wait 2 seconds before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  throw new Error(`[DB] Failed to connect to MongoDB after ${maxRetries} attempts: ${lastError?.message}`);
}

export async function initializeIndexes() {
  try {
    const { createIndexes } = await import("./migrations/addIndexes.js");
    await createIndexes();
  } catch (error: any) {
    console.warn("[DB] Could not create indexes:", error.message);
  }
}

// Warm up the connection pool by making test queries
export async function warmUpConnectionPool() {
  try {
    console.log("[DB] Warming up connection pool...");
    const { Role } = await import("../db/models/index.js");

    // Make multiple concurrent queries to pre-establish connections
    const warmupQueries = [
      Role.countDocuments().lean(),
      Role.countDocuments().lean(),
      Role.countDocuments().lean(),
      Role.countDocuments().lean(),
      Role.countDocuments().lean(),
    ];

    await Promise.all(warmupQueries);
    console.log("[DB] ✓ Connection pool warmed up");
  } catch (error: any) {
    console.warn("[DB] Warning: Could not warm up connection pool:", error.message);
    // Don't fail the startup, but warn
  }
}

export function getDBConnectionStatus() {
  return {
    state: mongoose.connection.readyState,
    isConnecting,
    connected: mongoose.connection.readyState === 1,
  };
}

export default mongoose;
