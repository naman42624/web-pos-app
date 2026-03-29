import "dotenv/config";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import bcryptjs from "bcryptjs";
import { eq } from "drizzle-orm";

async function createAdmin() {
  const email = (process.argv[2] || "admin@example.com").toLowerCase().trim();
  const password = process.argv[3] || "password123";
  const name = process.argv[4] || "Admin";

  try {
    console.log("Checking if user already exists...");
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      console.log(`✗ User with email "${email}" already exists`);
      process.exit(1);
    }

    // Create admin user
    console.log(`Creating admin user: ${email}`);
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    await db.insert(users).values({
      email,
      password: hashedPassword,
      name,
      isAdmin: true,
      isActive: true,
    });

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
