import { User, Role } from "../db/models/index.js";
import { connectDB } from "../db/connection.js";
import mongoose from "mongoose";

export async function ensureSuperAdminExists() {
  try {
    await connectDB();

    const superAdminEmail = "gauravbhatia3630@gmail.com";

    try {
      const existingUser = await User.findOne({ email: superAdminEmail });

      if (existingUser) {
        if (!existingUser.isAdmin) {
          existingUser.isAdmin = true;
          existingUser.role = undefined;
          await existingUser.save();
          console.log(`Updated ${superAdminEmail} to admin status`);
        } else {
          console.log(`Super admin already exists: ${superAdminEmail}`);
        }
        return;
      }
    } catch (findError) {
      console.warn("Could not query existing user, will attempt to clear collection");
      await User.collection.deleteMany({});
    }

    const superAdmin = new User({
      email: superAdminEmail,
      password: "Gaurav",
      name: "Gaurav Bhatia",
      isAdmin: true,
      isActive: true,
    });

    await superAdmin.save();
    console.log(`Created super admin user: ${superAdminEmail}`);
  } catch (error: any) {
    console.error("Error creating super admin:", error.message);
  }
}
