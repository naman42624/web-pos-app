import { Request, Response, NextFunction } from "express";
import { extractTokenFromHeader, verifyToken } from "../utils/auth.js";

export interface AuthRequest extends Request {
  userId?: string;
  email?: string;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;

    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({ error: "Missing or invalid token" });
    }

    const payload = verifyToken(token);

    if (!payload) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }


    req.userId = payload.userId;
    req.email = payload.email;

    next();
  } catch (error: any) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ error: "Unauthorized" });
  }
}
