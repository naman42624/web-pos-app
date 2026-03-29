import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import bcryptjs from "bcryptjs";

export async function ensureSuperAdminExists() {
  try {
    const superAdminEmail = "gauravbhatia3630@gmail.com";

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, superAdminEmail.toLowerCase().trim()),
    });

    if (existingUser) {
      if (!existingUser.isAdmin) {
        await db
          .update(users)
          .set({ isAdmin: true, roleId: null, updatedAt: new Date() })
          .where(eq(users.id, existingUser.id));
        console.log(`Updated ${superAdminEmail} to admin status`);
      } else {
        console.log(`Super admin already exists: ${superAdminEmail}`);
      }
      return;
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash("Gaurav", salt);

    await db.insert(users).values({
      email: superAdminEmail,
      password: hashedPassword,
      name: "Gaurav Bhatia",
      isAdmin: true,
      isActive: true,
    });

    console.log(`Created super admin user: ${superAdminEmail}`);
  } catch (error: any) {
    console.error("Error creating super admin:", error.message);
  }
}
