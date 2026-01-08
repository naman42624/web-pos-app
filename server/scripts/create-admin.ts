import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../db/models/index.js";

async function createAdmin() {
  const email = process.argv[2] || "admin@example.com";
  const password = process.argv[3] || "password123";
  const name = process.argv[4] || "Admin";

  try {
    const mongoUrl = process.env.MONGODB_URL || "mongodb://localhost:27017/pos-system";
    
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUrl);
    console.log("✓ Connected to MongoDB");

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`✗ User with email "${email}" already exists`);
      process.exit(1);
    }

    // Create admin user
    console.log(`Creating admin user: ${email}`);
    const user = new User({
      email,
      password,
      name,
    });

    await user.save();
    console.log(`✓ Admin user created successfully`);
    console.log(`\nLogin Credentials:`);
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
    console.log(`  Name: ${name}`);

    process.exit(0);
  } catch (error) {
    console.error("✗ Error creating admin user:", error);
    process.exit(1);
  }
}

createAdmin();
