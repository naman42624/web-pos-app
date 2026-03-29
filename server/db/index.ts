import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || "postgres://gauravbhatia@localhost:5432/pos_db",
});

export const db = drizzle(pool, { schema });

// Export the pool if needed (e.g. for manual queries)
export { pool };
