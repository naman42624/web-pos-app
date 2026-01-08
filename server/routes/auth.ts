import { Router, Request, Response } from "express";
import { User } from "../db/models/index.js";
import { generateToken } from "../utils/auth.js";
import { connectDB } from "../db/connection.js";

const router = Router();

// Ensure DB is connected
router.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    return res.status(500).json({ error: "Database connection failed" });
  }
});

// Sign up
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Check if this is the first user - if so, make them an admin
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? "admin" : "staff";

    // Create new user
    const user = new User({ email, password, name, role });
    await user.save();

    // Generate token
    const token = generateToken(user._id.toString(), user.email);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        roleIds: user.roleIds || [],
      },
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    res.status(500).json({ error: error.message || "Signup failed" });
  }
});

// Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Auto-promote first user to admin on login
    const userCount = await User.countDocuments();
    if (userCount === 1 && user.role !== "admin") {
      user.role = "admin";
      await user.save();
      console.log(`Auto-promoted first user ${email} to admin on login`);
    }

    // Generate token
    const token = generateToken(user._id.toString(), user.email);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        roleIds: user.roleIds || [],
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message || "Login failed" });
  }
});

// Logout (client-side will just remove token)
router.post("/logout", (_req: Request, res: Response) => {
  res.status(200).json({ message: "Logout successful" });
});

// Initialize first user as admin (for existing users)
router.post("/init-admin", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check how many users exist
    const userCount = await User.countDocuments();

    // Only allow this if there's exactly one user (the one being promoted)
    if (userCount !== 1) {
      return res.status(400).json({
        error:
          "Initialization only allowed with exactly one user in the system",
      });
    }

    // Find and promote the user to admin
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.role = "admin";
    await user.save();

    res.status(200).json({
      message: "User promoted to admin",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Init admin error:", error);
    res.status(500).json({ error: error.message || "Initialization failed" });
  }
});

export default router;
