import { Response } from "express";

export function handleDatabaseError(error: any, res: Response) {
  console.error("[DB Error]", {
    name: error.name,
    message: error.message,
    code: error.code,
  });

  // Connection timeout
  if (
    error.message.includes("timed out") ||
    error.message.includes("ECONNREFUSED") ||
    error.name === "MongoServerError"
  ) {
    return res.status(503).json({
      error: "Database connection error. The server is temporarily unavailable.",
      details: "Please try again in a moment.",
    });
  }

  // Authentication error
  if (error.message.includes("authentication failed")) {
    return res.status(500).json({
      error: "Database authentication error",
      details: "Invalid database credentials",
    });
  }

  // Document validation error
  if (error.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation error",
      details: error.message,
    });
  }

  // Cast error (invalid ObjectId)
  if (error.name === "CastError") {
    return res.status(400).json({
      error: "Invalid ID format",
      details: error.message,
    });
  }

  // Default error
  return res.status(500).json({
    error: error.message || "An error occurred",
  });
}

export function isConnectionError(error: any): boolean {
  return (
    error.message?.includes("timed out") ||
    error.message?.includes("ECONNREFUSED") ||
    error.message?.includes("ENOTFOUND") ||
    error.name === "MongoServerError" ||
    error.code === "ECONNREFUSED"
  );
}
