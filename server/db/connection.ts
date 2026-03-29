import { db } from "./index.js";
import { sql } from "drizzle-orm";

export async function connectDB() {
  try {
    console.log("[DB] Verifying PostgreSQL connection...");
    // Simple query to verify connection
    await db.execute(sql`SELECT 1`);
    console.log("[DB] PostgreSQL connected successfully");
    return db;
  } catch (error: any) {
    console.error("[DB] PostgreSQL connection error:", {
      message: error.message,
    });
    throw error;
  }
}

export async function ensureDBConnected() {
  const maxRetries = 5;
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      await connectDB();
      return;
    } catch (error) {
      lastError = error as Error;
      console.warn(`[DB] Connection attempt ${i + 1}/${maxRetries} failed:`, lastError.message);
      if (i < maxRetries - 1) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }

  throw new Error(`[DB] Failed to connect to PostgreSQL after ${maxRetries} attempts: ${lastError?.message}`);
}

export async function initializeIndexes() {
  // PostgeSQL indexes are handled via Drizzle migrations
  console.log("[DB] Index initialization skipped (managed by migrations)");
}

export function getDBConnectionStatus() {
  return {
    connected: true, // If we're here, we're likely connected as Drizzle uses a pool
    type: "postgresql",
  };
}

export default db;
