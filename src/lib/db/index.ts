// Re-export database connection and schema
export { db, schema } from "@/drizzle";

// Re-export common database operations
export { eq, and, or, desc, asc, sql } from "drizzle-orm";
