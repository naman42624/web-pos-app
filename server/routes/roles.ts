import { Router, Response } from "express";
import { db } from "../db/index.js";
import { roles, users } from "../db/schema.js";
import { authMiddleware, AuthRequest } from "../middleware/authMiddleware.js";
import { getCache, setCache, clearCache } from "../utils/cache.js";
import { eq, sql, count } from "drizzle-orm";

const router = Router();

router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // Check cache first
    const cached = getCache<any[]>("roles:all");
    if (cached) {
      return res.json(cached);
    }

    const allRoles = await db.query.roles.findMany();

    // Cache for 5 minutes
    setCache("roles:all", allRoles, 300);
    res.json(allRoles);
  } catch (error: any) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const role = await db.query.roles.findFirst({
      where: eq(roles.id, req.params.id),
    });
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }
    res.json(role);
  } catch (error: any) {
    console.error("Error fetching role:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = await db.query.users.findFirst({
      where: eq(users.id, req.userId!),
    });
    if (!currentUser?.isAdmin) {
      return res.status(403).json({ error: "Only admins can create roles" });
    }

    const { name, permissions } = req.body;

    if (!name || !permissions) {
      return res.status(400).json({
        error: "Role name and permissions are required",
      });
    }

    const existingRole = await db.query.roles.findFirst({
      where: eq(roles.name, name),
    });
    if (existingRole) {
      return res.status(400).json({ error: "Role already exists" });
    }

    const [newRole] = await db
      .insert(roles)
      .values({
        name,
        permissions,
      })
      .returning();

    // Invalidate cache when new role is created
    clearCache("roles");

    res.status(201).json(newRole);
  } catch (error: any) {
    console.error("Error creating role:", error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = await db.query.users.findFirst({
      where: eq(users.id, req.userId!),
    });
    if (!currentUser?.isAdmin) {
      return res.status(403).json({ error: "Only admins can update roles" });
    }

    const { name, permissions } = req.body;
    
    const updateData: any = { updatedAt: new Date() };
    if (name) updateData.name = name;
    if (permissions) updateData.permissions = permissions;

    const [updatedRole] = await db
      .update(roles)
      .set(updateData)
      .where(eq(roles.id, req.params.id))
      .returning();

    if (!updatedRole) {
      return res.status(404).json({ error: "Role not found" });
    }

    // Invalidate cache when role is updated
    clearCache("roles");

    res.json(updatedRole);
  } catch (error: any) {
    console.error("Error updating role:", error);
    res.status(500).json({ error: error.message });
  }
});

router.delete(
  "/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const currentUser = await db.query.users.findFirst({
        where: eq(users.id, req.userId!),
      });
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ error: "Only admins can delete roles" });
      }

      const [{ count: usersWithRole }] = await db
        .select({ count: count() })
        .from(users)
        .where(eq(users.roleId, req.params.id));

      if (usersWithRole > 0) {
        return res.status(400).json({
          error: "Cannot delete role that is assigned to users",
        });
      }

      const [deletedRole] = await db
        .delete(roles)
        .where(eq(roles.id, req.params.id))
        .returning();

      if (!deletedRole) {
        return res.status(404).json({ error: "Role not found" });
      }

      // Invalidate cache when role is deleted
      clearCache("roles");

      res.json({ message: "Role deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting role:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

export default router;
