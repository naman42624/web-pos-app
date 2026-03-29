import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware.js";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

export type PermissionEntity = 
  | "sales" 
  | "items" 
  | "products" 
  | "customers" 
  | "deliveryBoys" 
  | "creditRecords" 
  | "settings";

export type PermissionAction = "view" | "add" | "edit" | "changeStatus" | "delete";

export function checkPermission(
  entity: PermissionEntity,
  action: PermissionAction,
) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const user = await db.query.users.findFirst({
        where: eq(users.id, req.userId),
        with: {
          role: true,
        },
      });

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

      const permissions = (user.role.permissions || {}) as any;
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
