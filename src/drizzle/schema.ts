import {
  pgSchema,
  uuid,
  varchar,
  text,
  timestamp,
  index,
  numeric,
  unique,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const dbSchema = pgSchema("dev-reports");

// Drivers table - normalized driver information
export const drivers = dbSchema.table(
  "drivers",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    branch: varchar("branch", { length: 100 }).notNull(),
    lastFour: varchar("last_four", { length: 4 }),
    alias: varchar("alias", { length: 255 }),
    isActive: boolean("is_active").default(true).notNull(),
    // Metadata
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    // Indexes for better query performance
    index("drivers_name_idx").on(table.name),
    index("drivers_branch_idx").on(table.branch),
    // Composite index for unique driver-branch combinations
    index("drivers_name_branch_idx").on(table.name, table.branch),
  ]
);

// Transactions table - matches Transaction type
export const transactions = dbSchema.table(
  "transactions",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    driverId: uuid("driver_id")
      .notNull()
      .references(() => drivers.id),
    // Core transaction fields
    transactionReference: varchar("transaction_reference", {
      length: 255,
    }).notNull(),
    cardholderName: varchar("cardholder_name", { length: 255 }).notNull(),
    lastFourDigits: varchar("last_four_digits", { length: 4 }).notNull(),

    // Dates
    transactionDate: timestamp("transaction_date").notNull(),
    postingDate: timestamp("posting_date").notNull(),

    // Financial amounts (using decimal for precision)
    billingAmount: numeric("billing_amount", {
      precision: 10,
      scale: 2,
    }).notNull(),
    lineAmount: numeric("line_amount", { precision: 10, scale: 2 }).notNull(),
    lineNumber: varchar("line_number", { length: 50 }).notNull(),

    // GL Code information
    glCode: varchar("gl_code", { length: 150 }),
    glCodeDescription: text("gl_code_description"),

    // Transaction details
    reasonForExpense: text("reason_for_expense"),
    receiptImageName: varchar("receipt_image_name", { length: 500 }),
    receiptImageReferenceId: varchar("receipt_image_reference_id", {
      length: 255,
    }),
    workflowStatus: varchar("workflow_status", { length: 100 }),

    // Supplier information
    supplierName: varchar("supplier_name", { length: 255 }),
    supplierCity: varchar("supplier_city", { length: 100 }),
    supplierState: varchar("supplier_state", { length: 100 }),
    merchantCategoryCode: varchar("merchant_category_code", { length: 10 }),

    // Fuel-specific fields (optional for fuel transactions)
    odometerReading: numeric("odometer_reading", { precision: 10, scale: 3 }),
    fuelQuantity: numeric("fuel_quantity", { precision: 8, scale: 3 }),
    fuelType: varchar("fuel_type", { length: 150 }),
    fuelUnitCost: numeric("fuel_unit_cost", { precision: 8, scale: 4 }),
    fuelUnitOfMeasure: varchar("fuel_unit_of_measure", { length: 20 }),

    // Metadata
    // RENAME THIS TO UPLOAD DATE
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    // Indexes for better query performance
    index("transactions_cardholder_name_idx").on(table.cardholderName),
    index("transactions_transaction_date_idx").on(table.transactionDate),
    index("transactions_gl_code_idx").on(table.glCode),
    index("transactions_supplier_state_idx").on(table.supplierState),
    index("transactions_workflow_status_idx").on(table.workflowStatus),
  ]
);

// Fuel Logs table - matches FuelLog type (normalized)
export const fuelLogs = dbSchema.table(
  "fuel_logs",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),

    // Core fuel transaction fields
    vehicleId: varchar("vehicle_id", { length: 100 }).notNull(),
    driverId: uuid("driver_id")
      .notNull()
      .references(() => drivers.id),

    // Date and invoice
    date: timestamp("date").notNull(),
    invoiceNumber: varchar("invoice_number", { length: 255 }).notNull(),

    // Fuel details
    gallons: numeric("gallons", { precision: 8, scale: 3 }).notNull(),
    cost: numeric("cost", { precision: 10, scale: 2 }).notNull(),

    // Location information
    sellerState: varchar("seller_state", { length: 100 }).notNull(),
    sellerName: varchar("seller_name", { length: 255 }).notNull(),

    // Vehicle information
    odometer: numeric("odometer", { precision: 10, scale: 2 }).notNull(),
    receipt: varchar("receipt", { length: 500 }),

    // Metadata
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    // Indexes for better query performance
    index("fuel_logs_vehicle_id_idx").on(table.vehicleId),
    index("fuel_logs_driver_id_idx").on(table.driverId),
    index("fuel_logs_date_idx").on(table.date),
    index("fuel_logs_seller_state_idx").on(table.sellerState),
    // Composite index for common queries
    index("fuel_logs_vehicle_driver_idx").on(table.vehicleId, table.driverId),
  ]
);

// Relations for better querying
export const driversRelations = relations(drivers, ({ many }) => ({
  fuelLogs: many(fuelLogs),
}));

export const fuelLogsRelations = relations(fuelLogs, ({ one }) => ({
  driver: one(drivers, {
    fields: [fuelLogs.driverId],
    references: [drivers.id],
  }),
}));

// Transaction-Fuel Log Matches junction table for server-side matching
export const transactionFuelMatches = dbSchema.table(
  "transaction_fuel_matches",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    transactionId: uuid("transaction_id")
      .notNull()
      .references(() => transactions.id),
    fuelLogId: uuid("fuel_log_id")
      .notNull()
      .references(() => fuelLogs.id),

    // Matching metadata
    matchType: varchar("match_type", { length: 50 }).notNull(), // "date_cost", "date_quantity", "date_supplier_state"
    confidence: numeric("confidence", { precision: 3, scale: 2 }).notNull(), // 0.00-1.00
    isActive: boolean("is_active").default(true).notNull(),

    // Audit fields
    createdAt: timestamp("created_at").defaultNow().notNull(),
    createdBy: varchar("created_by", { length: 50 })
      .default("system")
      .notNull(), // "system" or "manual"
  },
  (table) => [
    // Performance indexes
    index("matches_transaction_idx").on(table.transactionId),
    index("matches_fuel_log_idx").on(table.fuelLogId),
    index("matches_active_idx").on(table.isActive),
    index("matches_confidence_idx").on(table.confidence),

    // Composite indexes for common queries
    index("matches_transaction_active_idx").on(
      table.transactionId,
      table.isActive
    ),
    index("matches_fuel_log_active_idx").on(table.fuelLogId, table.isActive),

    // Prevent duplicate matches for same transaction-fuel log pair
    unique("unique_transaction_fuel_pair").on(
      table.transactionId,
      table.fuelLogId
    ),
  ]
);

// Relations for junction table
export const transactionFuelMatchesRelations = relations(
  transactionFuelMatches,
  ({ one }) => ({
    transaction: one(transactions, {
      fields: [transactionFuelMatches.transactionId],
      references: [transactions.id],
    }),
    fuelLog: one(fuelLogs, {
      fields: [transactionFuelMatches.fuelLogId],
      references: [fuelLogs.id],
    }),
  })
);

// =============================================================================
// AUTHENTICATION TABLES (Auth.js Integration)
// =============================================================================

// Users table - for authentication and authorization
export const users = dbSchema.table(
  "users",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    role: varchar("role", { length: 50 }).notNull().default("USER"), // 'admin' or 'user'
    branch: varchar("branch", { length: 100 }).notNull().default("MANHATTAN"),
    isActive: boolean("is_active").notNull().default(true),

    // Required password for credentials-only login
    hashedPassword: varchar("hashed_password", { length: 255 }).notNull(),

    // User preferences
    timezone: varchar("timezone", { length: 50 }).default("America/New_York"),

    // Password reset functionality
    resetToken: varchar("reset_token", { length: 255 }),
    resetTokenExpiry: timestamp("reset_token_expiry"),

    // Last login tracking
    lastLoginAt: timestamp("last_login_at"),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("users_email_idx").on(table.email),
    index("users_role_idx").on(table.role),
    index("users_active_idx").on(table.isActive),
  ]
);

// Sessions table - for persistent login sessions (simplified for credentials-only)
export const sessions = dbSchema.table(
  "sessions",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
    expires: timestamp("expires").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_token_idx").on(table.sessionToken),
  ]
);

// Quarter settings table - for admin-managed quarters (future feature)
export const quarterSettings = dbSchema.table(
  "quarter_settings",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    year: integer("year").notNull(),
    quarterNumber: integer("quarter_number").notNull(), // 1, 2, 3, 4
    quarterName: varchar("quarter_name", { length: 100 }).notNull(), // "Q1 2024" or custom name
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    isCurrent: boolean("is_current").notNull().default(false),

    // Audit trail
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    // Ensure unique quarters per year
    unique().on(table.year, table.quarterNumber),
    index("quarter_settings_year_idx").on(table.year),
    index("quarter_settings_active_idx").on(table.isActive),
  ]
);

// =============================================================================
// AUTH TABLE RELATIONS
// =============================================================================

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  quarterSettings: many(quarterSettings),
}));

// Session relations
export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// Quarter settings relations
export const quarterSettingsRelations = relations(
  quarterSettings,
  ({ one }) => ({
    createdBy: one(users, {
      fields: [quarterSettings.createdBy],
      references: [users.id],
    }),
  })
);
