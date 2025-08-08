import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// always include { schema } for type safety 
// this allows: db.schema.<table> to be type-safe 
export const db = drizzle(process.env.DATABASE_URL!, { schema, logger: true });

// Export schema for use in queries
export { schema };
