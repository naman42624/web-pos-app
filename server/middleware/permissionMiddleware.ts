import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware.js";
import { User } from "../db/models/index.js";
import { PermissionEntity, PermissionAction } from "../db/models/User.js";

export function createPermissionMiddleware(
  entity: PermissionEntity,
  action: PermissionAction,
) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "User ID not found in request" });
      }

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      // Admin users bypass permission checks
      if (user.role === "admin") {
        return next();
      }

      // Check if user has the required permission
      const entityPermissions = (user.permissions as any)[entity];
      if (!entityPermissions) {
        return res.status(403).json({
          error: `Access denied: No permissions configured for ${entity}`,
        });
      }

      const hasPermission = entityPermissions[action];
      if (!hasPermission) {
        return res.status(403).json({
          error: `Access denied: You don't have permission to ${action} ${entity}`,
        });
      }

      next();
    } catch (error: any) {
      console.error("Permission middleware error:", error);
      return res.status(500).json({ error: "Permission check failed" });
    }
  };
}
