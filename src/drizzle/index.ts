import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./schema";

// Create connection pool for transactions support
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

// always include { schema } for type safety
// this allows: db.schema.<table> to be type-safe
export const db = drizzle(pool, { schema, logger: true });

// Export schema for use in queries
export { schema };
