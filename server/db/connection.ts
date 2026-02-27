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
      return mongoose;
    }

    // If currently connecting, wait for it to finish
    if (isConnecting) {
      // Poll for connection to complete (max 10 seconds)
      let attempts = 0;
      while (isConnecting && attempts < 100) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (connectionError) {
        throw connectionError;
      }

      if (mongoose.connection.readyState === 1) {
        return mongoose;
      }
    }

    // Check current connection state
    if (mongoose.connection.readyState === 1) {
      cachedConnection = mongoose;
      return mongoose;
    }

    isConnecting = true;
    connectionError = null;

    console.log("[DB] Connecting to MongoDB with optimized pool settings...");
    await mongoose.connect(MONGODB_URL, {
      // Optimized pool settings for production
      maxPoolSize: 20,
      minPoolSize: 5,
      maxIdleTimeMS: 45000,
      waitQueueTimeoutMS: 10000,

      // Connection timeout settings
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,

      // Write concerns
      retryWrites: true,
      w: "majority",

      // Disable buffering for better error handling
      bufferCommands: false,
    });

    cachedConnection = mongoose;
    isConnecting = false;
    console.log("[DB] MongoDB connected successfully with optimized pool");
    return mongoose;
  } catch (error: any) {
    isConnecting = false;
    connectionError = error;
    console.error("[DB] MongoDB connection error:", error.message);
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

export function getDBConnectionStatus() {
  return {
    state: mongoose.connection.readyState,
    isConnecting,
    connected: mongoose.connection.readyState === 1,
  };
}

export default mongoose;
