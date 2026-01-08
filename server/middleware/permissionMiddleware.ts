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

      let user = await User.findById(req.userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      // Force-promote to admin if user is staff with no roles and is the first user created
      if (user.role !== "admin" && !user.roleIds?.length) {
        const firstUser = await User.findOne({}).sort({ createdAt: 1 }).lean();

        // If this is the first user created, make them admin
        if (firstUser && firstUser._id.toString() === req.userId) {
          user = await User.findByIdAndUpdate(
            req.userId,
            { role: "admin" },
            { new: true },
          );
        }
      }

      // Admin users bypass permission checks
      if (user && user.role === "admin") {
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
        console.log(
          `[Role Check] ${userWithRoles.email} has ${userWithRoles.roleIds.length} role(s)`,
        );
        // Aggregate permissions from all assigned roles
        let hasPermission = false;
        for (const roleDoc of userWithRoles.roleIds as any[]) {
          if (
            roleDoc &&
            roleDoc.permissions &&
            roleDoc.permissions[entity] &&
            roleDoc.permissions[entity][action]
          ) {
            console.log(
              `[Role Check] Permission granted via role ${(roleDoc as any).name}`,
            );
            hasPermission = true;
            break;
          }
        }

        if (!hasPermission) {
          console.log(
            `[Role Check] No role grants ${action} on ${entity}`,
          );
          return res.status(403).json({
            error: `Access denied: You don't have permission to ${action} ${entity}`,
          });
        }

        return next();
      }

      // Fallback to legacy per-user permissions if no roles assigned
      console.log(
        `[Legacy Fallback] No roles assigned, checking user permissions`,
      );
      const userPermissions = user!.permissions || defaultPermissions;
      const entityPermissions = (userPermissions as any)[entity];

      if (!entityPermissions) {
        console.log(`[Legacy Fallback] No permissions for entity ${entity}`);
        return res.status(403).json({
          error: `Access denied: No permissions configured for ${entity}`,
        });
      }

      const hasPermission = entityPermissions[action];
      console.log(
        `[Legacy Fallback] ${entity}.${action} = ${hasPermission}`,
      );
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
