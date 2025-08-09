// Re-export database connection and schema
export { db, schema } from "@/drizzle";

// Export types for better organization
export type {
  Expense_CSV_Row,
  Fuel_CSV_Row,
  Transaction,
  FuelTransaction,
} from "@/lib/types";

// Re-export common database operations
export { eq, and, or, desc, asc, sql } from "drizzle-orm";
