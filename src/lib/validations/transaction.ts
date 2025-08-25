import { z } from "zod";

// CSV row validation (what comes from Papa Parse)
export const ExpenseCSVRowSchema = z.object({
  employeeId: z.string().optional(),
  employeeFirstName: z.string().optional(),
  employeeLastName: z.string().optional(),
  employeeCompanyUnit: z.string().min(1, "Employee company unit is required"),
  cardHolderName: z.string().min(1, "Cardholder name is required"),
  lastFourDigits: z
    .string()
    .min(4, "Last four digits must be at least 4 characters"),
  transactionReference: z.string().min(1, "Transaction reference is required"),
  transactionDate: z.string().min(1, "Transaction date is required"),
  postingDate: z.string().min(1, "Posting date is required"),
  billingAmount: z.coerce.number(),
  lineAmount: z.coerce.number(),
  lineNumber: z.string(),
  glCode: z.string().min(1, "GL code is required"),
  glCodeDescription: z.string().optional(),
  reasonForExpense: z.string().optional(),
  receiptImageName: z.string().optional(),
  receiptImageReferenceId: z.string().optional(),
  workflowStatus: z.string().optional(),
  supplierName: z.string().optional(),
  supplierCity: z.string().optional(),
  supplierState: z.string().optional(),
  merchantCategoryCode: z.string().optional(),
  odometerReading: z.coerce.number().optional(),
  fuelQuantity: z.coerce.number().optional(),
  fuelType: z.string().optional(),
  fuelUnitCost: z.coerce.number().optional(),
  fuelUnitOfMeasure: z.string().optional(),
});

// API request validation
export const TransactionUploadRequestSchema = z.object({
  transactions: z
    .array(ExpenseCSVRowSchema)
    .min(1, "At least one transaction is required"),
});

// Response schema
export const ProcessedTransactionResultSchema = z.object({
  transactionsCreated: z.number(),
  duplicatesSkipped: z.number(),
  nonDriversSkipped: z.number(),
  validationErrors: z.array(z.string()),
  databaseErrors: z.array(z.string()),
});

export type ExpenseCSVRow = z.infer<typeof ExpenseCSVRowSchema>;
export type TransactionUploadRequest = z.infer<
  typeof TransactionUploadRequestSchema
>;
export type ProcessedTransactionResult = z.infer<
  typeof ProcessedTransactionResultSchema
>;
