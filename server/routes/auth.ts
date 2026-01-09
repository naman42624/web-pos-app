import { Router, Request, Response } from "express";
import { User, Role, DeliveryBoy } from "../db/models/index.js";
import { generateToken } from "../utils/auth.js";
import { connectDB } from "../db/connection.js";
import { authMiddleware, AuthRequest } from "../middleware/authMiddleware.js";

const router = Router();

router.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    return res.status(500).json({ error: "Database connection failed" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email }).populate("role");
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: "User account is inactive" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user._id.toString(), user.email);

    const userData = user.toJSON();

    res.status(200).json({
      token,
      user: {
        id: userData._id,
        email: userData.email,
        name: userData.name,
        isAdmin: userData.isAdmin,
        role: userData.role || null,
      },
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

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      user.password = newPassword;
      await user.save();

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
    const user = await User.findById(req.userId).populate("role");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = user.toJSON();
    res.status(200).json({
      id: userData._id,
      email: userData.email,
      name: userData.name,
      isAdmin: userData.isAdmin,
      isActive: userData.isActive,
      role: userData.role || null,
    });
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

    const deliveryBoy = await DeliveryBoy.findOne({
      phone: phone.trim(),
      pin: pin.trim(),
    });

    if (!deliveryBoy) {
      return res.status(401).json({ error: "Invalid phone number or PIN" });
    }

    res.status(200).json({
      id: deliveryBoy._id,
      name: deliveryBoy.name,
      phone: deliveryBoy.phone,
      status: deliveryBoy.status,
    });
  } catch (error: any) {
    console.error("Delivery boy verification error:", error);
    res
      .status(500)
      .json({ error: error.message || "Verification failed" });
  }
});

export default router;
