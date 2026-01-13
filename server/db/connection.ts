import mongoose from "mongoose";

const MONGODB_URL =
  process.env.MONGODB_URL || "mongodb://localhost:27017/pos-system";

// Global connection cache for serverless environments
let cachedConnection: typeof mongoose | null = null;

export async function connectDB() {
  try {
    // Return cached connection if available
    if (cachedConnection && mongoose.connection.readyState === 1) {
      console.log("Using cached MongoDB connection");
      return cachedConnection;
    }

    // Check current connection state
    if (mongoose.connection.readyState === 1) {
      console.log("MongoDB already connected");
      return mongoose;
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URL, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: "majority",
    });

    cachedConnection = mongoose;
    console.log("MongoDB connected successfully");
    return mongoose;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export default mongoose;
