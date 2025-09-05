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
    driverId: uuid("driver_id").notNull().references(() => drivers.id),
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
    fuelType: varchar("fuel_type", { length: 50 }),
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
