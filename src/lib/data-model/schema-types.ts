import { drivers, fuelLogs, transactions } from "@/drizzle/schema";

export type SelectTransaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

export type SelectDriver = typeof drivers.$inferSelect;
export type InsertDriver = typeof drivers.$inferInsert;

export type SelectFuelLog = typeof fuelLogs.$inferSelect;

export type BaseFuelLog = Omit<SelectFuelLog, "createdAt" | "updatedAt">;
