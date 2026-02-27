import mongoose from "mongoose";

const MONGODB_URL =
  process.env.MONGODB_URL || "mongodb://localhost:27017/pos-system";

// Global connection cache for serverless environments
let cachedConnection: typeof mongoose | null = null;

export async function connectDB() {
  try {
    // Return cached connection if available
    if (cachedConnection && mongoose.connection.readyState === 1) {
      console.log("[DB] Using cached MongoDB connection");
      return cachedConnection;
    }

    // Check current connection state
    if (mongoose.connection.readyState === 1) {
      console.log("[DB] MongoDB already connected");
      return mongoose;
        
    console.log("[DB] Connecting to MongoDB...");
    console.log("[DB] MONGODB_URL:", MONGODB_URL.substring(0, 50) + "...");

    await mongoose.connect(MONGODB_URL, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: "majority",
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

export default mongoose;
