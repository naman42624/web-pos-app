import { Request, Response, NextFunction } from "express";
import { pool } from "../db/index";

export async function dbHealthCheck(req: Request, res: Response, next: NextFunction) {
  try {
    // Check if we can get a client from the pool
    const client = await pool.connect();
    client.release();
    next();
  } catch (error) {
    console.warn(
      `[DB Health] Database not connected. Path: ${req.path}`,
      error
    );

    return res.status(503).json({
      error: "Database connection unavailable",
      details: {
        message: "Could not connect to PostgreSQL pool",
      },
    });
  }
}

export async function getConnectionState(): Promise<{
  connected: boolean;
  description: string;
}> {
  try {
    const client = await pool.connect();
    client.release();
    return {
      connected: true,
      description: "connected",
    };
  } catch (error) {
    return {
      connected: false,
      description: "disconnected",
    };
  }
}
