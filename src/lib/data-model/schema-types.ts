import { drivers, fuelTransactions, transactions } from "@/drizzle/schema";

export type SelectTransaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

export type SelectDriver = typeof drivers.$inferSelect;
export type InsertDriver = typeof drivers.$inferInsert;

export type SelectFuelTransaction = typeof fuelTransactions.$inferSelect;

export type BaseFuelTransaction = Omit<SelectFuelTransaction, "createdAt" | "updatedAt">;
