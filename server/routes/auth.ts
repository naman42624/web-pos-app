import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { users, roles, deliveryBoys } from "../db/schema.js";
import { generateToken } from "../utils/auth.js";
import { authMiddleware, AuthRequest } from "../middleware/authMiddleware.js";
import { eq, and } from "drizzle-orm";
import bcryptjs from "bcryptjs";

const router = Router();

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase().trim()),
      with: {
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: "User account is inactive" });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user.id, user.email);

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      token,
      user: userWithoutPassword,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message || "Login failed" });
  }
});

router.post("/logout", (_req: Request, res: Response) => {
  res.status(200).json({ message: "Logout successful" });
});

router.post(
  "/change-password",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          error: "Current password and new password are required",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          error: "New password must be at least 6 characters",
        });
      }

      const user = await db.query.users.findFirst({
        where: eq(users.id, req.userId!),
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const isPasswordValid = await bcryptjs.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(newPassword, salt);

      await db
        .update(users)
        .set({ password: hashedPassword, updatedAt: new Date() })
        .where(eq(users.id, req.userId!));

      res.status(200).json({ message: "Password changed successfully" });
    } catch (error: any) {
      console.error("Change password error:", error);
      res
        .status(500)
        .json({ error: error.message || "Password change failed" });
    }
  },
);

router.get("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.userId!),
      with: {
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } catch (error: any) {
    console.error("Get current user error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch user" });
  }
});

router.post("/delivery-boy/verify", async (req: Request, res: Response) => {
  try {
    const { phone, pin } = req.body;

    if (!phone || !pin) {
      return res.status(400).json({ error: "Phone and PIN are required" });
    }

    const deliveryBoy = await db.query.deliveryBoys.findFirst({
      where: and(
        eq(deliveryBoys.phone, phone.trim()),
        eq(deliveryBoys.pin, pin.trim())
      ),
    });

    if (!deliveryBoy) {
      return res.status(401).json({ error: "Invalid phone number or PIN" });
    }

    res.status(200).json({
      id: deliveryBoy.id,
      name: deliveryBoy.name,
      phone: deliveryBoy.phone,
      status: deliveryBoy.status,
    });
  } catch (error: any) {
    console.error("Delivery boy verification error:", error);
    res.status(500).json({ error: error.message || "Verification failed" });
  }
});

export default router;
