import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export function dbHealthCheck(req: Request, res: Response, next: NextFunction) {
  const dbState = mongoose.connection.readyState;

  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (dbState !== 1) {
    console.warn(
      `[DB Health] Database not connected. State: ${dbState}. Path: ${req.path}`
    );

    return res.status(503).json({
      error: "Database connection unavailable",
      details: {
        state: dbState,
        message:
          dbState === 0
            ? "Database disconnected"
            : dbState === 2
              ? "Database connecting"
              : "Database disconnecting",
      },
    });
  }

  next();
}

export function getConnectionState(): {
  connected: boolean;
  state: number;
  description: string;
} {
  const state = mongoose.connection.readyState;
  const stateMap: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return {
    connected: state === 1,
    state,
    description: stateMap[state] || "unknown",
  };
}
