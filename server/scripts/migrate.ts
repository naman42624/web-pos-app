import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from both root and current directory
dotenv.config({ path: path.join(__dirname, "../../.env") });
dotenv.config({ path: path.join(__dirname, "../.env") });

import mongoose from "mongoose";
import { db } from "../db/index.js";
import * as schema from "../db/schema.js";
import { connectDB } from "../db/connection.js";
import * as models from "../db/models/index.js";
import { sql, eq } from "drizzle-orm";

import pg from "pg";

async function migrate() {
  console.log("Starting migration from MongoDB to PostgreSQL...");

  const mongoUrl = process.env.MONGODB_URL;
  if (!mongoUrl) {
    console.error("❌ MONGODB_URL not found in environment variables");
    process.exit(1);
  }

  // Debug: print redacted URL
  const redactedUrl = mongoUrl.replace(/:([^@]+)@/, ":****@");
  console.log(`[Debug] Using MongoDB URL: ${redactedUrl}`);

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ DATABASE_URL not found in environment variables");
    process.exit(1);
  }

  try {
    // 1. Ensure target database exists
    // Simple regex to parse postgresql://user:pass@host:port/database
    const dbMatch = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:/]+)(?::(\d+))?\/([^?]+)/);
    
    if (dbMatch) {
      const [_full, user, password, host, port, targetDb] = dbMatch;
      
      // Connect to 'postgres' default database to check/create target DB
      const pgClient = new pg.Client({
        user,
        password,
        host,
        port: port ? parseInt(port) : 5432,
        database: "postgres"
      });
      
      try {
        console.log(`Checking if database "${targetDb}" exists...`);
        await pgClient.connect();
        const res = await pgClient.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [targetDb]);
        
        if (res.rowCount === 0) {
          console.log(`Creating database "${targetDb}"...`);
          // Cannot run CREATE DATABASE in a transaction block or with parameterized name
          await pgClient.query(`CREATE DATABASE "${targetDb}"`);
          console.log(`✓ Database "${targetDb}" created`);
        } else {
          console.log(`✓ Database "${targetDb}" already exists`);
        }
      } catch (err: any) {
        console.warn(`[DB Init] Warning: Could not verify or create database automatically: ${err.message}`);
        console.log("Continuing with migration (assuming database already exists or will be handled by the environment)");
      } finally {
        await pgClient.end();
      }
    }

    // 2. Connect to both databases
    console.log("Connecting to PostgreSQL...");
    await connectDB();
    console.log("✓ Connected to PostgreSQL");

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUrl);
    console.log("✓ Connected to MongoDB");

    // Clear existing data (optional, for idempotency during testing)
    // await db.delete(schema.users);
    // ...

    // 2. Migrate Roles
    const mongoRoles = await models.Role.find().lean();
    console.log(`Migrating ${mongoRoles.length} roles...`);
    for (const role of mongoRoles) {
      await db.insert(schema.roles).values({
        id: role._id.toString(),
        name: role.name,
        permissions: role.permissions || {},
        createdAt: role.createdAt ? new Date(role.createdAt) : new Date(),
        updatedAt: role.updatedAt ? new Date(role.updatedAt) : new Date(),
      }).onConflictDoUpdate({
        target: schema.roles.id,
        set: { 
          name: role.name, 
          permissions: role.permissions, 
          updatedAt: role.updatedAt ? new Date(role.updatedAt) : new Date() 
        }
      });
    }

    // 3. Migrate Users
    const mongoUsers = await models.User.find().lean();
    console.log(`Migrating ${mongoUsers.length} users...`);
    for (const user of mongoUsers) {
      await db.insert(schema.users).values({
        id: user._id.toString(),
        email: user.email,
        password: user.password,
        name: user.name,
        isAdmin: !!user.isAdmin,
        isActive: user.isActive !== false,
        roleId: user.role?.toString(),
        createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
        updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
      }).onConflictDoNothing();
    }

    // 4. Migrate Categories
    const mongoCategories = await models.Category.find().lean();
    console.log(`Migrating ${mongoCategories.length} categories...`);
    for (const cat of mongoCategories) {
      await db.insert(schema.categories).values({
        id: cat._id.toString(),
        name: cat.name,
        description: cat.description,
        createdAt: cat.createdAt ? new Date(cat.createdAt) : new Date(),
        updatedAt: cat.updatedAt ? new Date(cat.updatedAt) : new Date(),
      }).onConflictDoNothing();
    }

    // 5. Migrate Items
    const mongoItems = await models.Item.find().lean();
    console.log(`Migrating ${mongoItems.length} items...`);
    for (const item of mongoItems) {
      await db.insert(schema.items).values({
        id: item._id.toString(),
        name: item.name,
        price: item.price.toString(),
        stock: item.stock,
        image: item.image,
        categoryId: item.category?.toString(),
        gstRate: item.gstRate?.toString() || "0.00",
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
      }).onConflictDoNothing();
    }

    // 6. Migrate Products & Composition
    const mongoProducts = (await models.Product.find().lean()) as any[];
    console.log(`Migrating ${mongoProducts.length} products...`);
    const migratedProductIds = new Set<string>();
    
    for (const prod of mongoProducts) {
      await db.insert(schema.products).values({
        id: prod._id.toString(),
        name: prod.name,
        price: prod.price.toString(),
        stock: prod.stock,
        image: prod.image,
        createdAt: prod.createdAt ? new Date(prod.createdAt) : new Date(),
        updatedAt: prod.updatedAt ? new Date(prod.updatedAt) : new Date(),
      }).onConflictDoNothing();

      migratedProductIds.add(prod._id.toString());

      // Migrate composition
      if (prod.items && prod.items.length > 0) {
        for (const comp of prod.items) {
          if (comp.itemId) {
            await db.insert(schema.productItems).values({
              productId: prod._id.toString(),
              itemId: comp.itemId.toString(),
              quantity: comp.quantity,
            }).onConflictDoNothing();
          }
        }
      }
    }

    // 7. Migrate Customers & Addresses
    const mongoCustomers = await models.Customer.find().lean();
    console.log(`Migrating ${mongoCustomers.length} customers...`);
    for (const cust of mongoCustomers) {
      await db.insert(schema.customers).values({
        id: cust._id.toString(),
        name: cust.name,
        phone: cust.phone,
        altPhone: cust.altPhone,
        email: cust.email,
        organization: cust.organization,
        totalCredit: (cust.totalCredit || 0).toString(),
        createdAt: cust.createdAt ? new Date(cust.createdAt) : new Date(),
        updatedAt: cust.updatedAt ? new Date(cust.updatedAt) : new Date(),
      }).onConflictDoNothing();

      // Addresses
      if (cust.addresses && cust.addresses.length > 0) {
        for (const addr of cust.addresses) {
           await db.insert(schema.customerAddresses).values({
             customerId: cust._id.toString(),
             address: typeof addr === 'string' ? addr : addr.address,
           });
        }
      }
    }

    // 8. Migrate Delivery Boys
    const mongoDeliveryBoys = (await models.DeliveryBoy.find().lean()) as any[];
    console.log(`Migrating ${mongoDeliveryBoys.length} delivery boys...`);
    for (const boy of mongoDeliveryBoys) {
      await db.insert(schema.deliveryBoys).values({
        id: boy._id.toString(),
        name: boy.name,
        phone: boy.phone,
        pin: boy.pin,
        status: boy.status || "available",
        createdAt: boy.createdAt ? new Date(boy.createdAt) : new Date(),
        updatedAt: boy.updatedAt ? new Date(boy.updatedAt) : new Date(),
      }).onConflictDoNothing();
    }

    // 9. Migrate Sales & Sale Items
    const mongoSales = await models.Sale.find().lean();
    console.log(`Migrating ${mongoSales.length} sales...`);
    for (const sale of mongoSales) {
      await db.insert(schema.sales).values({
        id: sale._id.toString(),
        customerId: sale.customerId?.toString(),
        total: sale.total.toString(),
        subtotal: (sale.subtotal || sale.total).toString(),
        gstAmount: (sale.gstAmount || 0).toString(),
        discountAmount: (sale.discountAmount || 0).toString(),
        deliveryCharges: (sale.deliveryCharges || 0).toString(),
        paymentMode: sale.paymentMode || "cash",
        paymentStatus: sale.paymentStatus || "pending",
        status: sale.status || "pending",
        orderType: sale.orderType || "takeaway",
        pickupDate: sale.pickupDate,
        pickupTime: sale.pickupTime,
        deliveryDetails: sale.deliveryDetails,
        paymentAmounts: sale.paymentAmounts,
        createdAt: sale.createdAt ? new Date(sale.createdAt) : new Date(),
        updatedAt: sale.updatedAt ? new Date(sale.updatedAt) : new Date(),
      }).onConflictDoNothing();

      // Sale Items
      if (sale.items && sale.items.length > 0) {
        for (const item of sale.items) {
          const productId = item.productId?.toString();
          
          // Verify if product exists to avoid FK violation
          if (productId && !migratedProductIds.has(productId)) {
            console.warn(`[Warning] Sale ${sale._id} references missing product ${productId}. Skipping product reference.`);
            await db.insert(schema.saleItems).values({
              saleId: sale._id.toString(),
              productId: null, // Allow NULL if FK is not mandatory (check schema)
              name: item.name,
              quantity: item.quantity,
              price: (item.price || 0).toString(),
              composition: item.composition,
            });
            continue;
          }

          await db.insert(schema.saleItems).values({
            saleId: sale._id.toString(),
            productId: productId,
            name: item.name,
            quantity: item.quantity,
            price: (item.price || 0).toString(),
            composition: item.composition,
          });
        }
      }
    }

    // 10. Migrate Credit Records
    const mongoCreditRecords = (await models.CreditRecord.find().lean()) as any[];
    console.log(`Migrating ${mongoCreditRecords.length} credit records...`);
    for (const record of mongoCreditRecords) {
      await db.insert(schema.creditRecords).values({
        id: record._id.toString(),
        customerId: record.customerId.toString(),
        amount: record.amount.toString(),
        type: record.type || "credit",
        saleId: record.saleId?.toString(),
        date: record.date ? new Date(record.date) : new Date(),
        remarks: record.remarks,
      }).onConflictDoNothing();
    }

    // 11. Migrate Settings
    const mongoSettings = (await models.Settings.findOne().lean()) as any;
    if (mongoSettings) {
      console.log("Migrating settings...");
      await db.insert(schema.settings).values({
        id: mongoSettings._id.toString(),
        shopName: mongoSettings.shopName,
        shopAddress: mongoSettings.shopAddress,
        shopPhone: mongoSettings.shopPhone,
        shopEmail: mongoSettings.shopEmail,
        taxNumber: mongoSettings.taxNumber,
        currency: mongoSettings.currency || "INR",
        updatedAt: mongoSettings.updatedAt ? new Date(mongoSettings.updatedAt) : new Date(),
      }).onConflictDoNothing();
    }

    console.log("✅ Migration complete!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    process.exit(0);
  }
}

migrate();
