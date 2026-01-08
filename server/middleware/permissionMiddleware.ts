import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware.js";
import { User } from "../db/models/index.js";
import {
  PermissionEntity,
  PermissionAction,
} from "../db/models/Role.js";

export function checkPermission(
  entity: PermissionEntity,
  action: PermissionAction
) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const user = await User.findById(req.userId).populate("role");
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      if (!user.isActive) {
        return res.status(403).json({ error: "User account is inactive" });
      }

      if (user.isAdmin) {
        return next();
      }

      if (!user.role) {
        return res.status(403).json({
          error: `Access denied: You don't have permission to ${action} ${entity}`,
        });
      }

      const roleDoc = user.role as any;
      const permissions = roleDoc.permissions || {};
      const entityPermissions = permissions[entity] || {};
      const hasPermission = entityPermissions[action];

      if (!hasPermission) {
        return res.status(403).json({
          error: `Access denied: You don't have permission to ${action} ${entity}`,
        });
      }

      next();
    } catch (error: any) {
      console.error("Permission check error:", error);
      return res.status(500).json({ error: "Permission check failed" });
    }
  };
}
