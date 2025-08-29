import {
  drivers,
  fuelLogs,
  transactions,
  transactionFuelMatches,
} from "@/drizzle/schema";

export type SelectTransaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

export type SelectDriver = typeof drivers.$inferSelect;
export type InsertDriver = typeof drivers.$inferInsert;

export type SelectFuelLog = typeof fuelLogs.$inferSelect;

export type BaseFuelLog = Omit<SelectFuelLog, "createdAt" | "updatedAt">;

// Transaction-Fuel Log Match types
export type SelectTransactionFuelMatch =
  typeof transactionFuelMatches.$inferSelect;
export type InsertTransactionFuelMatch =
  typeof transactionFuelMatches.$inferInsert;
