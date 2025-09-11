import {
  drivers,
  fuelLogs,
  transactions,
  transactionFuelMatches,
  users,
} from "@/drizzle/schema";

export type SelectTransaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

export type SelectDriver = typeof drivers.$inferSelect;
export type InsertDriver = typeof drivers.$inferInsert;

export type SelectFuelLog = typeof fuelLogs.$inferSelect;

export type BaseFuelLog = Omit<SelectFuelLog, "createdAt" | "updatedAt">;

export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Derived type for getAllUsers query result
export type UserListItem = Pick<
  SelectUser,
  | "id"
  | "email"
  | "name"
  | "role"
  | "branch"
  | "isActive"
  | "timezone"
  | "lastLoginAt"
  | "createdAt"
  | "updatedAt"
>;

// Derived type for basic user info (excluding sensitive fields)
export type UserSummary = Pick<
  SelectUser,
  "id" | "email" | "name" | "role" | "branch" | "isActive"
>;

// Derived type for user creation response
export type CreatedUser = Pick<
  SelectUser,
  "id" | "email" | "name" | "role" | "isActive" | "createdAt"
>;

// Transaction-Fuel Log Match types
export type SelectTransactionFuelMatch =
  typeof transactionFuelMatches.$inferSelect;
export type InsertTransactionFuelMatch =
  typeof transactionFuelMatches.$inferInsert;
