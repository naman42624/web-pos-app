import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware.js";
import { User, Role } from "../db/models/index.js";
import { PermissionEntity, PermissionAction } from "../db/models/User.js";

const defaultPermissions = {
  sales: { view: false, add: false, edit: false, changeStatus: false },
  items: { view: false, add: false, edit: false, changeStatus: false },
  products: { view: false, add: false, edit: false, changeStatus: false },
  customers: { view: false, add: false, edit: false, changeStatus: false },
  deliveryBoys: { view: false, add: false, edit: false, changeStatus: false },
};

const adminPermissions = {
  sales: { view: true, add: true, edit: true, changeStatus: true },
  items: { view: true, add: true, edit: true, changeStatus: true },
  products: { view: true, add: true, edit: true, changeStatus: true },
  customers: { view: true, add: true, edit: true, changeStatus: true },
  deliveryBoys: { view: true, add: true, edit: true, changeStatus: true },
};

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

      // Auto-promote first user to admin if not already
      const userCount = await User.countDocuments();
      if (userCount === 1 && user.role !== "admin") {
        user.role = "admin";
        await user.save();
        console.log(
          `Permission middleware: Auto-promoted first user ${user.email} to admin`,
        );
      }

      // Admin users bypass permission checks
      if (user.role === "admin") {
        // Ensure admin users have all permissions
        if (!user.permissions) {
          (user as any).permissions = adminPermissions;
        }
        return next();
      }

      // Check if user has assigned roles
      const userWithRoles = await User.findById(req.userId).populate("roleIds");

      // If user has assigned roles, check them
      if (
        userWithRoles &&
        Array.isArray(userWithRoles.roleIds) &&
        userWithRoles.roleIds.length > 0
      ) {
        // Aggregate permissions from all assigned roles
        let hasPermission = false;
        for (const roleDoc of userWithRoles.roleIds as any[]) {
          if (
            roleDoc &&
            roleDoc.permissions &&
            roleDoc.permissions[entity] &&
            roleDoc.permissions[entity][action]
          ) {
            hasPermission = true;
            break;
          }
        }

        if (!hasPermission) {
          return res.status(403).json({
            error: `Access denied: You don't have permission to ${action} ${entity}`,
          });
        }

        return next();
      }

      // Fallback to legacy per-user permissions if no roles assigned
      const userPermissions = user.permissions || defaultPermissions;
      const entityPermissions = (userPermissions as any)[entity];

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
