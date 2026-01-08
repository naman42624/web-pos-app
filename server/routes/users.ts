import { Router, Response } from "express";
import { User, Role } from "../db/models/index.js";
import { authMiddleware, AuthRequest } from "../middleware/authMiddleware.js";
import { connectDB } from "../db/connection.js";

const router = Router();

router.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    return res.status(500).json({ error: "Database connection failed" });
  }
});

router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = await User.findById(req.userId);
    if (!currentUser?.isAdmin) {
      return res.status(403).json({ error: "Only admins can view users" });
    }

    const users = await User.find()
      .select("-password")
      .populate("role")
      .lean();

    res.json(users);
  } catch (error: any) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get(
  "/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const currentUser = await User.findById(req.userId);
      if (!currentUser?.isAdmin && req.userId !== req.params.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      const user = await User.findById(req.params.id)
        .select("-password")
        .populate("role")
        .lean();

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error: any) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = await User.findById(req.userId);
    if (!currentUser?.isAdmin) {
      return res.status(403).json({ error: "Only admins can create users" });
    }

    const { email, password, name, roleId, isActive } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        error: "Email, password, and name are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    const user = new User({
      email,
      password,
      name,
      isActive: isActive !== false,
      isAdmin: false,
      role: roleId || null,
    });

    await user.save();
    await user.populate("role");

    const userData = user.toJSON();
    res.status(201).json({
      id: userData._id,
      email: userData.email,
      name: userData.name,
      isAdmin: userData.isAdmin,
      isActive: userData.isActive,
      role: userData.role,
    });
  } catch (error: any) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: error.message });
  }
});

router.put(
  "/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const currentUser = await User.findById(req.userId);
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ error: "Only admins can edit users" });
      }

      const { name, roleId, isActive } = req.body;
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (name) user.name = name;
      if (roleId !== undefined) user.role = roleId || null;
      if (isActive !== undefined) user.isActive = isActive;

      await user.save();
      await user.populate("role");

      const userData = user.toJSON();
      res.json({
        id: userData._id,
        email: userData.email,
        name: userData.name,
        isAdmin: userData.isAdmin,
        isActive: userData.isActive,
        role: userData.role,
      });
    } catch (error: any) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

router.delete(
  "/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const currentUser = await User.findById(req.userId);
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ error: "Only admins can delete users" });
      }

      if (req.userId === req.params.id) {
        return res.status(400).json({ error: "Cannot delete your own account" });
      }

      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ message: "User deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
