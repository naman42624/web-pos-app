import { Router, Response } from "express";
import {
  Item,
  Product,
  Customer,
  Sale,
  CreditRecord,
  DeliveryBoy,
  Settings,
  User,
} from "../db/models/index.js";
import { AuthRequest, authMiddleware } from "../middleware/authMiddleware.js";
import { createPermissionMiddleware } from "../middleware/permissionMiddleware.js";
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

// ===== ITEMS =====
router.get(
  "/items",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const items = await Item.find().lean();
      res.json(items);
    } catch (error: any) {
      console.error("Error fetching items:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

router.post(
  "/items",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, price, stock, image } = req.body;
      const item = new Item({ name, price, stock, image });
      await item.save();
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

router.put(
  "/items/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      res.json(item);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

router.delete(
  "/items/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      await Item.findByIdAndDelete(req.params.id);
      res.json({ message: "Item deleted" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

// ===== PRODUCTS =====
router.get(
  "/products",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const products = await Product.find().lean();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.post(
  "/products",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, price, stock, image, items } = req.body;
      const product = new Product({ name, price, stock, image, items });
      await product.save();
      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

router.put(
  "/products/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

router.delete(
  "/products/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: "Product deleted" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

// ===== CUSTOMERS =====
router.get(
  "/customers",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const customers = await Customer.find().lean();
      res.json(customers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.post(
  "/customers",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const customer = new Customer(req.body);
      await customer.save();
      res.status(201).json(customer);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

router.get(
  "/customers/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const customer = await Customer.findById(req.params.id).lean();
      res.json(customer);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

router.put(
  "/customers/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const customer = await Customer.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true },
      );
      res.json(customer);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

router.delete(
  "/customers/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      await Customer.findByIdAndDelete(req.params.id);
      res.json({ message: "Customer deleted" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

// ===== SALES =====
router.get(
  "/sales",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const sales = await Sale.find().lean();
      res.json(sales);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.get(
  "/sales/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const sale = await Sale.findById(req.params.id).lean();
      res.json(sale);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

router.post(
  "/sales",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const sale = new Sale(req.body);
      await sale.save();
      res.status(201).json(sale);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

router.put(
  "/sales/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const sale = await Sale.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      res.json(sale);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

router.delete(
  "/sales/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      await Sale.findByIdAndDelete(req.params.id);
      res.json({ message: "Sale deleted" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

// ===== CREDIT RECORDS =====
router.get(
  "/credit-records",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const records = await CreditRecord.find().lean();
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.post(
  "/credit-records",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const record = new CreditRecord(req.body);
      await record.save();
      res.status(201).json(record);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

// ===== DELIVERY BOYS =====
router.get(
  "/delivery-boys",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const boys = await DeliveryBoy.find().lean();
      res.json(boys);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.post(
  "/delivery-boys",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const boy = new DeliveryBoy(req.body);
      await boy.save();
      res.status(201).json(boy);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

router.put(
  "/delivery-boys/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const boy = await DeliveryBoy.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      res.json(boy);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

// ===== SETTINGS =====
router.get(
  "/settings",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const settings = await Settings.findOne().lean();
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.put(
  "/settings",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      let settings = await Settings.findOne();
      if (!settings) {
        settings = new Settings(req.body);
      } else {
        Object.assign(settings, req.body);
      }
      await settings.save();
      res.json(settings);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

// ===== USERS =====
router.get(
  "/users",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const users = await User.find().select("-password").lean();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.post(
  "/users",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { email, password, name, role } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      const user = new User({
        email,
        password,
        name,
        role: role || "staff",
        isActive: true,
      });

      await user.save();

      const userWithoutPassword = user.toObject();
      delete (userWithoutPassword as any).password;

      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

router.put(
  "/users/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, role, isActive, permissions } = req.body;

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (role !== undefined) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (permissions !== undefined) updateData.permissions = permissions;

      const user = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true },
      ).select("-password");

      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

router.delete(
  "/users/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: "User deleted" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

export default router;
