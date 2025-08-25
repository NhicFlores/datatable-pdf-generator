import {
  pgSchema,
  uuid,
  varchar,
  text,
  timestamp,
  index,
  numeric,
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

export type SelectTransaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

// Fuel Transactions table - matches FuelTransaction type (normalized)
export const fuelTransactions = dbSchema.table(
  "fuel_transactions",
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
    index("fuel_transactions_vehicle_id_idx").on(table.vehicleId),
    index("fuel_transactions_driver_id_idx").on(table.driverId),
    index("fuel_transactions_date_idx").on(table.date),
    index("fuel_transactions_seller_state_idx").on(table.sellerState),
    // Composite index for common queries
    index("fuel_transactions_vehicle_driver_idx").on(
      table.vehicleId,
      table.driverId
    ),
  ]
);

// Relations for better querying
export const driversRelations = relations(drivers, ({ many }) => ({
  fuelTransactions: many(fuelTransactions),
}));

export const fuelTransactionsRelations = relations(
  fuelTransactions,
  ({ one }) => ({
    driver: one(drivers, {
      fields: [fuelTransactions.driverId],
      references: [drivers.id],
    }),
  })
);

