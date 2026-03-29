import { Router, Response } from "express";
import { db } from "../db/index.js";
import {
  items,
  products,
  customers,
  sales,
  creditRecords,
  deliveryBoys,
  categories,
  settings,
  productItems,
  customerAddresses,
  saleItems as saleItemsTable,
} from "../db/schema.js";
import { AuthRequest, authMiddleware } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";
import { eq, and, sql, desc, count } from "drizzle-orm";
import { handleMongoError, logMongoError } from "../utils/errorHandler.js";

const router = Router();

router.get(
  "/items",
  authMiddleware,
  checkPermission("items", "view"),
  async (_req: AuthRequest, res: Response) => {
    try {
      const allItems = await db.query.items.findMany({
        with: {
          category: true,
        },
      });
      res.json(allItems.map(i => ({
        ...i,
        category: i.category?.name || null
      })));
    } catch (error: any) {
      console.error("Error fetching items:", error);
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
      const { name, price, stock, image, categoryId, gstRate } = req.body;

      // Validate image size (limit to 5MB)
      if (image && image.length > 5 * 1024 * 1024) {
        return res
          .status(400)
          .json({ error: "Image size must be less than 5MB" });
      }

      const [newItem] = await db.insert(items).values({
        name,
        price: price?.toString() || "0.00",
        stock: stock || 0,
        image,
        categoryId: categoryId || null,
        gstRate: gstRate?.toString() || "0.00",
      }).returning();

      res.status(201).json(newItem);
    } catch (error: any) {
      console.error("Error creating item:", error);
      res.status(400).json({ error: error.message });
    }
  },
);

router.put(
  "/items/:id",
  authMiddleware,
  checkPermission("items", "edit"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, price, stock, image, categoryId, gstRate } = req.body;
      const [updatedItem] = await db
        .update(items)
        .set({
          name,
          price: price?.toString(),
          stock,
          image,
          categoryId: categoryId || null,
          gstRate: gstRate?.toString(),
          updatedAt: new Date(),
        })
        .where(eq(items.id, req.params.id))
        .returning();
      
      if (!updatedItem) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(updatedItem);
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
      const [deletedItem] = await db.delete(items).where(eq(items.id, req.params.id)).returning();
      if (!deletedItem) {
        return res.status(404).json({ error: "Item not found" });
      }
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
      const allCategories = await db.query.categories.findMany();
      res.json(allCategories);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
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
      const [newCategory] = await db.insert(categories).values({
        name,
        description,
      }).returning();
      res.status(201).json(newCategory);
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
      const [deletedCategory] = await db.delete(categories).where(eq(categories.id, req.params.id)).returning();
      if (!deletedCategory) {
         return res.status(404).json({ error: "Category not found" });
      }
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
      const allProducts = await db.query.products.findMany({
        with: {
          productItems: true,
        },
      });
      res.json(allProducts);
    } catch (error: any) {
      console.error("Error fetching products:", error);
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
      const { name, price, stock, image, items: compositionItems } = req.body;
      
      const [newProduct] = await db.insert(products).values({
        name,
        price: price?.toString() || "0.00",
        stock: stock || 0,
        image,
      }).returning();

      if (compositionItems && compositionItems.length > 0) {
        await db.insert(productItems).values(
          compositionItems.map((ci: any) => ({
            productId: newProduct.id,
            itemId: ci.itemId,
            quantity: ci.quantity,
          }))
        );
      }

      const productWithItems = await db.query.products.findFirst({
        where: eq(products.id, newProduct.id),
        with: {
            productItems: true,
        }
      });

      res.status(201).json(productWithItems);
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
      const { name, price, stock, image, items: compositionItems } = req.body;
      
      const [updatedProduct] = await db.update(products).set({
        name,
        price: price?.toString(),
        stock,
        image,
        updatedAt: new Date(),
      })
      .where(eq(products.id, req.params.id))
      .returning();

      if (!updatedProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      if (compositionItems) {
        // Simple sync: delete old and insert new
        await db.delete(productItems).where(eq(productItems.productId, req.params.id));
        if (compositionItems.length > 0) {
          await db.insert(productItems).values(
            compositionItems.map((ci: any) => ({
              productId: updatedProduct.id,
              itemId: ci.itemId,
              quantity: ci.quantity,
            }))
          );
        }
      }

      const productWithItems = await db.query.products.findFirst({
        where: eq(products.id, updatedProduct.id),
        with: {
            productItems: true,
        }
      });

      res.json(productWithItems);
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
      const [deletedProduct] = await db.delete(products).where(eq(products.id, req.params.id)).returning();
      if (!deletedProduct) {
        return res.status(404).json({ error: "Product not found" });
      }
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
      const allCustomers = await db.query.customers.findMany({
        with: {
          addresses: true,
        },
      });
      res.json(allCustomers);
    } catch (error: any) {
      console.error("Error fetching customers:", error);
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
      const { name, phone, altPhone, email, organization, addresses } = req.body;
      const [newCustomer] = await db.insert(customers).values({
        name,
        phone,
        altPhone,
        email,
        organization,
      }).returning();

      if (addresses && addresses.length > 0) {
        await db.insert(customerAddresses).values(
            addresses.map((addr: any) => ({
                customerId: newCustomer.id,
                address: typeof addr === 'string' ? addr : addr.address,
            }))
        );
      }

      const customerWithAddresses = await db.query.customers.findFirst({
        where: eq(customers.id, newCustomer.id),
        with: {
            addresses: true,
        }
      });

      console.log("[API] Creating customer with body:", JSON.stringify(req.body, null, 2));
      res.status(201).json(customerWithAddresses);
    } catch (error: any) {
      console.error("[API] Error creating customer:", error);
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
      const customer = await db.query.customers.findFirst({
        where: eq(customers.id, req.params.id),
        with: {
          addresses: true,
        },
      });
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
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
      const { name, phone, altPhone, email, organization, addresses, totalCredit } = req.body;
      const [updatedCustomer] = await db.update(customers).set({
        name,
        phone,
        altPhone,
        email,
        organization,
        totalCredit: totalCredit !== undefined ? totalCredit.toString() : undefined,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, req.params.id))
      .returning();

      if (!updatedCustomer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      if (addresses) {
        await db.delete(customerAddresses).where(eq(customerAddresses.customerId, req.params.id));
        if (addresses.length > 0) {
            await db.insert(customerAddresses).values(
                addresses.map((addr: any) => ({
                    customerId: updatedCustomer.id,
                    address: typeof addr === 'string' ? addr : addr.address,
                }))
            );
        }
      }

      const customerWithAddresses = await db.query.customers.findFirst({
        where: eq(customers.id, updatedCustomer.id),
        with: {
            addresses: true,
        }
      });

      res.json(customerWithAddresses);
    } catch (error: any) {
      console.error("Error updating customer:", error);
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
      const [deletedCustomer] = await db.delete(customers).where(eq(customers.id, req.params.id)).returning();
      if (!deletedCustomer) {
        return res.status(404).json({ error: "Customer not found" });
      }
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
      const allSales = (await db.query.sales.findMany({
        with: {
          items: true,
          customer: true,
        },
        orderBy: [desc(sales.createdAt)],
      })).map(s => ({ ...s, date: s.createdAt }));
      res.json(allSales);
    } catch (error: any) {
      console.error("Error fetching sales:", error);
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
      const matchedSales = (await db.query.sales.findMany({
          where: and(
            sql`delivery_details->>'assignedDeliveryBoyId' = ${deliveryBoyId}`,
            eq(sales.orderType, "delivery")
          ),
          with: {
            items: true,
          }
      })).map(s => ({ ...s, date: s.createdAt }));
      res.json(matchedSales);
    } catch (error: any) {
      console.error("[API] Error fetching sales for delivery boy:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

// Public endpoint for delivery boys to update delivery status (no auth required)
router.post(
  "/delivery/update-status",
  async (req: AuthRequest, res: Response) => {
    try {
      const { saleId, status, paymentStatus } = req.body;

      if (!saleId || !status) {
        return res.status(400).json({ error: "saleId and status are required" });
      }

      const updateData: any = { status, updatedAt: new Date() };
      if (paymentStatus) {
        updateData.paymentStatus = paymentStatus;
      }

      const [updatedSale] = await db
        .update(sales)
        .set(updateData)
        .where(eq(sales.id, saleId))
        .returning();

      if (!updatedSale) {
        return res.status(404).json({ error: "Sale not found" });
      }

      res.json(updatedSale);
    } catch (error: any) {
      console.error("[API] Error updating delivery boy sale status:", error);
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
      const sale = await db.query.sales.findFirst({
        where: eq(sales.id, req.params.id),
        with: {
          items: true,
          customer: true,
        },
      });
      if (!sale) {
        return res.status(404).json({ error: "Sale not found" });
      }
      res.json({ ...sale, date: sale.createdAt });
    } catch (error: any) {
      console.error("Error fetching sale:", error);
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
      const { items: saleItems, customerId, total, subtotal, gstAmount, orderType, paymentMode, paymentStatus, status, deliveryDetails, paymentAmounts, discountAmount, deliveryCharges, pickupDate, pickupTime, isQuickSale } = req.body;
      
      const [newSale] = await db.insert(sales).values({
        customerId: customerId || null,
        total: total?.toString() || "0.00",
        subtotal: subtotal?.toString() || "0.00",
        gstAmount: gstAmount?.toString() || "0.00",
        discountAmount: discountAmount?.toString() || "0.00",
        deliveryCharges: deliveryCharges?.toString() || "0.00",
        paymentMode,
        paymentStatus: paymentStatus || "pending",
        status: status || "pending",
        orderType,
        deliveryDetails,
        paymentAmounts,
        pickupDate,
        pickupTime,
        isQuickSale: isQuickSale || false,
      }).returning();

      if (saleItems && saleItems.length > 0) {
        await db.insert(saleItemsTable).values(
            saleItems.map((si: any) => ({
                saleId: newSale.id,
                productId: si.productId,
                name: si.name,
                quantity: si.quantity,
                price: si.price?.toString(),
                composition: si.composition,
            }))
        );
      }

      const completedSale = await db.query.sales.findFirst({
        where: eq(sales.id, newSale.id),
        with: {
          items: true,
        }
      });

      console.log("[API] Creating sale with body:", JSON.stringify(req.body, null, 2));
      res.status(201).json({ ...completedSale, date: completedSale!.createdAt });
    } catch (error: any) {
      console.error("[API] Error creating sale:", error);
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
      const [updatedSale] = await db
        .update(sales)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(sales.id, req.params.id))
        .returning();
      
      if (!updatedSale) {
        return res.status(404).json({ error: "Sale not found" });
      }
      res.json({ ...updatedSale, date: updatedSale.createdAt });
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
      const [deletedSale] = await db.delete(sales).where(eq(sales.id, req.params.id)).returning();
      if (!deletedSale) {
        return res.status(404).json({ error: "Sale not found" });
      }
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
      const allRecords = await db.query.creditRecords.findMany({
        with: {
            customer: true,
        },
        orderBy: [desc(creditRecords.date)],
      });
      res.json(allRecords);
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
      const { customerId, amount, type, saleId, remarks } = req.body;
      const [newRecord] = await db.insert(creditRecords).values({
        customerId,
        amount: amount?.toString(),
        type,
        saleId: saleId || null,
        remarks,
      }).returning();
      res.status(201).json(newRecord);
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
      const allBoys = await db.query.deliveryBoys.findMany();
      res.json(allBoys);
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
      const [newBoy] = await db.insert(deliveryBoys).values(req.body).returning();
      res.status(201).json(newBoy);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

// Public endpoint for delivery boys to update their own status - MUST COME BEFORE /:id ROUTES
router.put(
  "/delivery-boys/:id/status",
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !["available", "busy"].includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }

      const [updatedBoy] = await db
        .update(deliveryBoys)
        .set({ status, updatedAt: new Date() })
        .where(eq(deliveryBoys.id, id))
        .returning();

      if (!updatedBoy) {
        return res.status(404).json({ error: "Delivery boy not found" });
      }

      res.json(updatedBoy);
    } catch (error: any) {
      console.error("[API] Error updating delivery boy status:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

router.put(
  "/delivery-boys/:id",
  authMiddleware,
  checkPermission("deliveryBoys", "edit"),
  async (req: AuthRequest, res: Response) => {
    try {
      const [updatedBoy] = await db
        .update(deliveryBoys)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(deliveryBoys.id, req.params.id))
        .returning();
      
      if (!updatedBoy) {
        return res.status(404).json({ error: "Delivery boy not found" });
      }
      res.json(updatedBoy);
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
      const currentSettings = await db.query.settings.findFirst();
      res.json(currentSettings);
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
      const existingSettings = await db.query.settings.findFirst();
      let result;
      if (!existingSettings) {
        [result] = await db.insert(settings).values(req.body).returning();
      } else {
        [result] = await db.update(settings).set({ ...req.body, updatedAt: new Date() }).returning();
      }
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

export default router;
