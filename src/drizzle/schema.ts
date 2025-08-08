import {
  pgSchema,
  uuid,
  varchar,
  text,
  timestamp,
  decimal,
  integer,
  index,
} from "drizzle-orm/pg-core";

export const dbSchema = pgSchema("dev-reports");

// Transactions table - matches Transaction type
export const transactions = dbSchema.table(
  "transactions",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),

    // Core transaction fields
    transactionReference: varchar("transaction_reference", { length: 255 })
      .notNull()
      .unique(),
    cardholderName: varchar("cardholder_name", { length: 255 }).notNull(),
    lastFourDigits: varchar("last_four_digits", { length: 4 }).notNull(),

    // Dates
    transactionDate: timestamp("transaction_date").notNull(),
    postingDate: timestamp("posting_date").notNull(),

    // Financial amounts (using decimal for precision)
    billingAmount: decimal("billing_amount", {
      precision: 10,
      scale: 2,
    }).notNull(),
    lineAmount: decimal("line_amount", { precision: 10, scale: 2 }).notNull(),
    lineNumber: integer("line_number").notNull(),

    // GL Code information
    glCode: varchar("gl_code", { length: 50 }).notNull(),
    glCodeDescription: text("gl_code_description"),

    // Transaction details
    reasonForExpense: text("reason_for_expense"),
    receiptImageName: varchar("receipt_image_name", { length: 500 }),
    receiptImageReferenceId: varchar("receipt_image_reference_id", {
      length: 255,
    }),

    // Supplier information
    supplierName: varchar("supplier_name", { length: 255 }),
    supplierCity: varchar("supplier_city", { length: 100 }),
    supplierState: varchar("supplier_state", { length: 100 }),

    // Status and categorization
    workflowStatus: varchar("workflow_status", { length: 100 }),
    merchantCategoryCode: varchar("merchant_category_code", { length: 10 }),

    // Fuel-specific fields (optional for fuel transactions)
    odometerReading: integer("odometer_reading"),
    fuelQuantity: decimal("fuel_quantity", { precision: 8, scale: 3 }),
    fuelType: varchar("fuel_type", { length: 50 }),
    fuelUnitCost: decimal("fuel_unit_cost", { precision: 8, scale: 4 }),
    fuelUnitOfMeasure: varchar("fuel_unit_of_measure", { length: 20 }),

    // Metadata
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    // Indexes for better query performance
    cardholderNameIdx: index("transactions_cardholder_name_idx").on(
      table.cardholderName
    ),
    transactionDateIdx: index("transactions_transaction_date_idx").on(
      table.transactionDate
    ),
    glCodeIdx: index("transactions_gl_code_idx").on(table.glCode),
    supplierStateIdx: index("transactions_supplier_state_idx").on(
      table.supplierState
    ),
    workflowStatusIdx: index("transactions_workflow_status_idx").on(
      table.workflowStatus
    ),
  })
);

// Fuel Transactions table - matches FuelTransaction type
export const fuelTransactions = dbSchema.table(
  "fuel_transactions",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),

    // Core fuel transaction fields
    vehicleId: varchar("vehicle_id", { length: 100 }).notNull(),
    driver: varchar("driver", { length: 255 }).notNull(),

    // Date and invoice
    date: timestamp("date").notNull(),
    invoiceNumber: varchar("invoice_number", { length: 255 }).notNull(),

    // Fuel details
    gallons: decimal("gallons", { precision: 8, scale: 3 }).notNull(),
    cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),

    // Location information
    sellerState: varchar("seller_state", { length: 100 }).notNull(),
    sellerName: varchar("seller_name", { length: 255 }).notNull(),

    // Vehicle information
    odometer: integer("odometer").notNull(),
    receipt: varchar("receipt", { length: 500 }),

    // Metadata
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    // Indexes for better query performance
    vehicleIdIdx: index("fuel_transactions_vehicle_id_idx").on(table.vehicleId),
    driverIdx: index("fuel_transactions_driver_idx").on(table.driver),
    dateIdx: index("fuel_transactions_date_idx").on(table.date),
    sellerStateIdx: index("fuel_transactions_seller_state_idx").on(
      table.sellerState
    ),
    // Composite index for common queries
    vehicleDriverIdx: index("fuel_transactions_vehicle_driver_idx").on(
      table.vehicleId,
      table.driver
    ),
  })
);
