import { Router, Response } from "express";
import { Role, User } from "../db/models/index.js";
import { authMiddleware, AuthRequest } from "../middleware/authMiddleware.js";
import { getCache, setCache, clearCache } from "../utils/cache.js";

const router = Router();

// DB connection is now established at server startup
// This middleware is removed to improve performance

router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // Check cache first
    const cached = getCache<typeof Role>("roles:all");
    if (cached) {
      return res.json(cached);
    }

    const roles = await Role.find().lean();

    // Cache for 5 minutes
    setCache("roles:all", roles, 300);
    res.json(roles);
  } catch (error: any) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const role = await Role.findById(req.params.id).lean();
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
    const currentUser = await User.findById(req.userId);
    if (!currentUser?.isAdmin) {
      return res.status(403).json({ error: "Only admins can create roles" });
    }

    const { name, description, permissions } = req.body;

    if (!name || !permissions) {
      return res.status(400).json({
        error: "Role name and permissions are required",
      });
    }

    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({ error: "Role already exists" });
    }

    const role = new Role({
      name,
      description: description || "",
      permissions,
    });

    await role.save();

    // Invalidate cache when new role is created
    clearCache("roles");

    res.status(201).json(role);
  } catch (error: any) {
    console.error("Error creating role:", error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = await User.findById(req.userId);
    if (!currentUser?.isAdmin) {
      return res.status(403).json({ error: "Only admins can update roles" });
    }

    const { name, description, permissions } = req.body;
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    if (name) role.name = name;
    if (description !== undefined) role.description = description;
    if (permissions) role.permissions = permissions;

    await role.save();

    // Invalidate cache when role is updated
    clearCache("roles");

    res.json(role);
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
      const currentUser = await User.findById(req.userId);
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ error: "Only admins can delete roles" });
      }

      const usersWithRole = await User.countDocuments({ role: req.params.id });
      if (usersWithRole > 0) {
        return res.status(400).json({
          error: "Cannot delete role that is assigned to users",
        });
      }

      const role = await Role.findByIdAndDelete(req.params.id);
      if (!role) {
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
