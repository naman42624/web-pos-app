import { Router, Response } from "express";
import { db } from "../db/index.js";
import { users, roles } from "../db/schema.js";
import { authMiddleware, AuthRequest } from "../middleware/authMiddleware.js";
import { eq, ne, and } from "drizzle-orm";
import bcryptjs from "bcryptjs";

const router = Router();

router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = await db.query.users.findFirst({
      where: eq(users.id, req.userId!),
    });

    if (!currentUser?.isAdmin) {
      return res.status(403).json({ error: "Only admins can view users" });
    }

    const allUsers = await db.query.users.findMany({
      with: {
        role: true,
      },
    });

    // Remove passwords from response
    const usersWithoutPasswords = allUsers.map((u) => {
      const { password, ...userWithoutPassword } = u;
      return userWithoutPassword;
    });

    res.json(usersWithoutPasswords);
  } catch (error: any) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = await db.query.users.findFirst({
      where: eq(users.id, req.userId!),
    });

    if (!currentUser?.isAdmin && req.userId !== req.params.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, req.params.id),
      with: {
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error: any) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = await db.query.users.findFirst({
      where: eq(users.id, req.userId!),
    });

    if (!currentUser?.isAdmin) {
      return res.status(403).json({ error: "Only admins can create users" });
    }

    const { email, password, name, roleId, isActive } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        error: "Email, password, and name are required",
      });
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const [newUser] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        isActive: isActive !== false,
        isAdmin: false,
        roleId: roleId || null,
      })
      .returning();

    // Fetch with role
    const userWithRole = await db.query.users.findFirst({
      where: eq(users.id, newUser.id),
      with: {
        role: true,
      },
    });

    if (!userWithRole) {
      throw new Error("Failed to fetch created user");
    }

    const { password: _, ...userWithoutPassword } = userWithRole;
    res.status(201).json(userWithoutPassword);
  } catch (error: any) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = await db.query.users.findFirst({
      where: eq(users.id, req.userId!),
    });

    if (!currentUser?.isAdmin) {
      return res.status(403).json({ error: "Only admins can edit users" });
    }

    const { name, roleId, isActive } = req.body;
    
    const updateData: any = { updatedAt: new Date() };
    if (name) updateData.name = name;
    if (roleId !== undefined) updateData.roleId = roleId || null;
    if (isActive !== undefined) updateData.isActive = isActive;

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, req.params.id))
      .returning();

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const userWithRole = await db.query.users.findFirst({
      where: eq(users.id, updatedUser.id),
      with: {
        role: true,
      },
    });

    if (!userWithRole) {
      throw new Error("Failed to fetch updated user");
    }

    const { password, ...userWithoutPassword } = userWithRole;
    res.json(userWithoutPassword);
  } catch (error: any) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: error.message });
  }
});

router.put(
  "/:id/password",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const currentUser = await db.query.users.findFirst({
        where: eq(users.id, req.userId!),
      });

      if (!currentUser?.isAdmin && req.userId !== req.params.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      const { password } = req.body;
      if (!password || password.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters" });
      }

      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(password, salt);

      const [updatedUser] = await db
        .update(users)
        .set({ password: hashedPassword, updatedAt: new Date() })
        .where(eq(users.id, req.params.id))
        .returning();

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ message: "Password updated successfully" });
    } catch (error: any) {
      console.error("Error changing password:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

router.delete(
  "/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const currentUser = await db.query.users.findFirst({
        where: eq(users.id, req.userId!),
      });

      if (!currentUser?.isAdmin) {
        return res.status(403).json({ error: "Only admins can delete users" });
      }

      if (req.userId === req.params.id) {
        return res
          .status(400)
          .json({ error: "Cannot delete your own account" });
      }

      const [deletedUser] = await db
        .delete(users)
        .where(eq(users.id, req.params.id))
        .returning();

      if (!deletedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ message: "User deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

export default router;
