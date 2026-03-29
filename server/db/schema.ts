import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  numeric,
  integer,
  jsonb,
  text,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import crypto from "crypto";

// Roles & Permissions
export const roles = pgTable("roles", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull().unique(),
  permissions: jsonb("permissions").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Users
export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  roleId: varchar("role_id", { length: 36 }).references(() => roles.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Categories
export const categories = pgTable("categories", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Items (Inventory)
export const items = pgTable("items", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull().unique(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull().default("0.00"),
  stock: integer("stock").notNull().default(0),
  image: text("image"),
  categoryId: varchar("category_id", { length: 36 }).references(() => categories.id),
  gstRate: numeric("gst_rate", { precision: 5, scale: 2 })
    .notNull()
    .default("0.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Products (Ready to sell)
export const products = pgTable("products", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull().unique(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull().default("0.00"),
  stock: integer("stock").notNull().default(0),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Product Item Composition (Junction table)
export const productItems = pgTable("product_items", {
  productId: varchar("product_id", { length: 36 })
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  itemId: varchar("item_id", { length: 36 })
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
}, (t) => {
  return [
    {
      pk: primaryKey({ columns: [t.productId, t.itemId] }),
    }
  ];
});

// Customers
export const customers = pgTable("customers", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  altPhone: varchar("alt_phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  organization: varchar("organization", { length: 255 }),
  totalCredit: numeric("total_credit", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Customer Addresses
export const customerAddresses = pgTable("customer_addresses", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  customerId: varchar("customer_id", { length: 36 })
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  address: text("address").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Sales
export const sales = pgTable("sales", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  customerId: varchar("customer_id", { length: 36 }).references(() => customers.id),
  total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0.00"),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
  gstAmount: numeric("gst_amount", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
  discountAmount: numeric("discount_amount", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
  deliveryCharges: numeric("delivery_charges", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
  paymentMode: varchar("payment_mode", { length: 50 }).notNull(),
  paymentStatus: varchar("payment_status", { length: 50 }).default("pending"),
  status: varchar("status", { length: 50 }).default("pending"),
  orderType: varchar("order_type", { length: 50 }).notNull(),
  pickupDate: varchar("pickup_date", { length: 50 }),
  pickupTime: varchar("pickup_time", { length: 50 }),
  deliveryDetails: jsonb("delivery_details"), // Keep as JSONB for receiver details
  paymentAmounts: jsonb("payment_amounts"), // Mixed payment modes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Sale Items
export const saleItems = pgTable("sale_items", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  saleId: varchar("sale_id", { length: 36 })
    .notNull()
    .references(() => sales.id, { onDelete: "cascade" }),
  productId: varchar("product_id", { length: 36 }).references(() => products.id),
  name: varchar("name", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  price: numeric("price", { precision: 12, scale: 2 }).notNull().default("0.00"),
  composition: jsonb("composition"), // Snapshotted composition
});

// Credit Records
export const creditRecords = pgTable("credit_records", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  customerId: varchar("customer_id", { length: 36 })
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'credit' or 'payment'
  saleId: varchar("sale_id", { length: 36 }).references(() => sales.id),
  date: timestamp("date").defaultNow().notNull(),
  remarks: text("remarks"),
});

// Delivery Boys
export const deliveryBoys = pgTable("delivery_boys", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  pin: varchar("pin", { length: 20 }),
  status: varchar("status", { length: 20 }).default("available"), // available, busy
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Settings
export const settings = pgTable("settings", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  shopName: varchar("shop_name", { length: 255 }).notNull(),
  shopAddress: text("shop_address"),
  shopPhone: varchar("shop_phone", { length: 20 }),
  shopEmail: varchar("shop_email", { length: 255 }),
  taxNumber: varchar("tax_number", { length: 50 }),
  currency: varchar("currency", { length: 10 }).default("INR"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const roleRelations = relations(roles, ({ many }) => ({
  users: many(users),
}));

export const userRelations = relations(users, ({ one }) => ({
  role: one(roles, { fields: [users.roleId], references: [roles.id] }),
}));

export const itemRelations = relations(items, ({ one, many }) => ({
  category: one(categories, { fields: [items.categoryId], references: [categories.id] }),
  productItems: many(productItems),
}));

export const productRelations = relations(products, ({ many }) => ({
  productItems: many(productItems),
  saleItems: many(saleItems),
}));

export const productItemRelations = relations(productItems, ({ one }) => ({
  product: one(products, { fields: [productItems.productId], references: [products.id] }),
  item: one(items, { fields: [productItems.itemId], references: [items.id] }),
}));

export const saleRelations = relations(sales, ({ one, many }) => ({
  customer: one(customers, { fields: [sales.customerId], references: [customers.id] }),
  items: many(saleItems),
  creditRecords: many(creditRecords),
}));

export const saleItemRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, { fields: [saleItems.saleId], references: [sales.id] }),
  product: one(products, { fields: [saleItems.productId], references: [products.id] }),
}));

export const customerRelations = relations(customers, ({ many }) => ({
  addresses: many(customerAddresses),
  sales: many(sales),
  creditRecords: many(creditRecords),
}));

export const customerAddressRelations = relations(customerAddresses, ({ one }) => ({
  customer: one(customers, { fields: [customerAddresses.customerId], references: [customers.id] }),
}));

export const creditRecordRelations = relations(creditRecords, ({ one }) => ({
  customer: one(customers, { fields: [creditRecords.customerId], references: [customers.id] }),
  sale: one(sales, { fields: [creditRecords.saleId], references: [sales.id] }),
}));
