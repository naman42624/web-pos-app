import { Router, Response } from "express";
import {
  Item,
  Product,
  Customer,
  Sale,
  CreditRecord,
  DeliveryBoy,
  Category,
  Settings,
} from "../db/models/index.js";
import { AuthRequest, authMiddleware } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";
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

router.get(
  "/items",
  authMiddleware,
  checkPermission("items", "view"),
  async (_req: AuthRequest, res: Response) => {
    try {
      const items = await Item.find().lean();
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.post(
  "/items",
  authMiddleware,
  checkPermission("items", "add"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, price, stock, image, category, gstRate } = req.body;

      // Validate image size (limit to 5MB)
      if (image && image.length > 5 * 1024 * 1024) {
        return res
          .status(400)
          .json({ error: "Image size must be less than 5MB" });
      }

      const item = new Item({ name, price, stock, image, category, gstRate });
      await item.save();
      res.status(201).json(item);
    } catch (error: any) {
      console.error("Error creating item:", error);
      if (error.message.includes("document exceeds")) {
        res
          .status(400)
          .json({ error: "Document size too large. Image is too big." });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  },
);

router.put(
  "/items/:id",
  authMiddleware,
  checkPermission("items", "edit"),
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
  checkPermission("items", "delete"),
  async (req: AuthRequest, res: Response) => {
    try {
      await Item.findByIdAndDelete(req.params.id);
      res.json({ message: "Item deleted" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

// Category endpoints
router.get(
  "/categories",
  authMiddleware,
  checkPermission("items", "view"),
  async (_req: AuthRequest, res: Response) => {
    try {
      const categories = await Category.find().lean();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.post(
  "/categories",
  authMiddleware,
  checkPermission("items", "add"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, description } = req.body;
      const category = new Category({ name, description });
      await category.save();
      res.status(201).json(category);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

router.delete(
  "/categories/:id",
  authMiddleware,
  checkPermission("items", "delete"),
  async (req: AuthRequest, res: Response) => {
    try {
      await Category.findByIdAndDelete(req.params.id);
      res.json({ message: "Category deleted" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

router.get(
  "/products",
  authMiddleware,
  checkPermission("products", "view"),
  async (_req: AuthRequest, res: Response) => {
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
  checkPermission("products", "add"),
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
  checkPermission("products", "edit"),
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
  checkPermission("products", "delete"),
  async (req: AuthRequest, res: Response) => {
    try {
      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: "Product deleted" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

router.get(
  "/customers",
  authMiddleware,
  checkPermission("customers", "view"),
  async (_req: AuthRequest, res: Response) => {
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
  checkPermission("customers", "add"),
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
  checkPermission("customers", "view"),
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
  checkPermission("customers", "edit"),
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
  checkPermission("customers", "delete"),
  async (req: AuthRequest, res: Response) => {
    try {
      await Customer.findByIdAndDelete(req.params.id);
      res.json({ message: "Customer deleted" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

router.get(
  "/sales",
  authMiddleware,
  checkPermission("sales", "view"),
  async (_req: AuthRequest, res: Response) => {
    try {
      const sales = await Sale.find().lean();
      res.json(sales);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get sales for a specific delivery boy (no auth required) - MUST COME BEFORE /:id ROUTES
router.get(
  "/sales/delivery-boy/:deliveryBoyId",
  async (req: AuthRequest, res: Response) => {
    try {
      const { deliveryBoyId } = req.params;
      console.log("[API] /sales/delivery-boy/:deliveryBoyId called with ID:", deliveryBoyId);
      const sales = await Sale.find({
        assignedDeliveryBoyId: deliveryBoyId,
        orderType: "delivery",
        status: { $ne: "cancelled" },
      }).lean();
      console.log(`[API] Found ${sales.length} sales for delivery boy ${deliveryBoyId}`);
      res.json(sales);
    } catch (error: any) {
      console.error("[API] Error fetching sales for delivery boy:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

router.get(
  "/sales/:id",
  authMiddleware,
  checkPermission("sales", "view"),
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
  checkPermission("sales", "add"),
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
  checkPermission("sales", "edit"),
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
  checkPermission("sales", "delete"),
  async (req: AuthRequest, res: Response) => {
    try {
      await Sale.findByIdAndDelete(req.params.id);
      res.json({ message: "Sale deleted" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

router.get(
  "/credit-records",
  authMiddleware,
  checkPermission("creditRecords", "view"),
  async (_req: AuthRequest, res: Response) => {
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
  checkPermission("creditRecords", "add"),
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

router.get(
  "/delivery-boys",
  authMiddleware,
  checkPermission("deliveryBoys", "view"),
  async (_req: AuthRequest, res: Response) => {
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
  checkPermission("deliveryBoys", "add"),
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
  checkPermission("deliveryBoys", "edit"),
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

router.get(
  "/settings",
  authMiddleware,
  checkPermission("settings", "view"),
  async (_req: AuthRequest, res: Response) => {
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
  checkPermission("settings", "edit"),
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

export default router;
