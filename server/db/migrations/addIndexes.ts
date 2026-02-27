import mongoose from "mongoose";
import { Sale, Customer, DeliveryBoy, User, Role } from "../models/index.js";

export async function createIndexes() {
  try {
    console.log("[Indexes] Creating database indexes for performance...");

    // Sale indexes - for frequent queries
    await Sale.collection.createIndex({ assignedDeliveryBoyId: 1 });
    await Sale.collection.createIndex({ customerId: 1 });
    await Sale.collection.createIndex({ status: 1 });
    await Sale.collection.createIndex({ date: -1 }); // For sorting by date
    await Sale.collection.createIndex({ orderType: 1, status: 1 }); // Compound index
    await Sale.collection.createIndex({ assignedDeliveryBoyId: 1, status: 1 }); // Delivery boy queries
    
    console.log("[Indexes] ✓ Sale indexes created");

    // Customer indexes
    await Customer.collection.createIndex({ phone: 1 });
    await Customer.collection.createIndex({ name: 1 });
    await Customer.collection.createIndex({ createdAt: -1 });
    
    console.log("[Indexes] ✓ Customer indexes created");

    // Delivery Boy indexes
    await DeliveryBoy.collection.createIndex({ phone: 1, pin: 1 });
    await DeliveryBoy.collection.createIndex({ status: 1 });
    
    console.log("[Indexes] ✓ Delivery Boy indexes created");

    // User indexes
    await User.collection.createIndex({ email: 1 });
    await User.collection.createIndex({ role: 1 });
    
    console.log("[Indexes] ✓ User indexes created");

    // Role indexes
    await Role.collection.createIndex({ name: 1 });
    
    console.log("[Indexes] ✓ Role indexes created");

    console.log("[Indexes] All database indexes created successfully");
  } catch (error: any) {
    console.error("[Indexes] Error creating indexes:", error.message);
    // Don't throw - indexing failure shouldn't prevent app startup
  }
}
