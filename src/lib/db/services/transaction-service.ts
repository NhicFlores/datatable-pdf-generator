import { Expense_CSV_Row } from "@/lib/types";
import { createManyTransactions } from "../mutations/transactions";
import { findDriverByName } from "../queries/drivers";

/**
 * Service layer for transaction business logic
 */

export interface ProcessedTransactionData {
  transactionsCreated: number;
  duplicatesSkipped: number;
  nonDriversSkipped: number;
  errors: string[];
}

export async function processTransactionCSVData(
  data: Expense_CSV_Row[]
): Promise<ProcessedTransactionData> {
  const result: ProcessedTransactionData = {
    transactionsCreated: 0,
    duplicatesSkipped: 0,
    nonDriversSkipped: 0,
    errors: [],
  };

  if (!data || data.length === 0) {
    result.errors.push("No data provided");
    return result;
  }

  try {
    // Step 1: Validate and transform data
    const transactionsToInsert = [];
    const processedReferences = new Set<string>();

    for (const row of data) {
      try {
        // Validate required fields
        if (!row.transactionReference) {
          result.errors.push(
            `Missing transaction reference in row: ${JSON.stringify(row)}`
          );
          continue;
        }

        if (!row.cardHolderName) {
          result.errors.push(
            `Missing cardholder name in row: ${JSON.stringify(row)}`
          );
          continue;
        }

        if (!row.lastFourDigits) {
          result.errors.push(
            `Missing last four digits in row: ${JSON.stringify(row)}`
          );
          continue;
        }

        if (!row.transactionDate) {
          result.errors.push(
            `Missing transaction date in row: ${JSON.stringify(row)}`
          );
          continue;
        }

        if (!row.glCode) {
          result.errors.push(`Missing GL code in row: ${JSON.stringify(row)}`);
          continue;
        }

        // Check if cardholder is a driver
        const driver = await findDriverByName(row.cardHolderName);
        if (!driver) {
          result.nonDriversSkipped++;
          result.errors.push(
            `Skipping transaction for non-driver employee: ${row.cardHolderName}`
          );
          continue;
        }

        // Check for duplicates within this batch
        if (processedReferences.has(row.transactionReference)) {
          result.duplicatesSkipped++;
          result.errors.push(
            `Duplicate transaction reference found: ${row.transactionReference}`
          );
          continue;
        }
        processedReferences.add(row.transactionReference);

        // Parse dates
        const transactionDate = new Date(row.transactionDate);
        if (isNaN(transactionDate.getTime())) {
          result.errors.push(
            `Invalid transaction date format: ${row.transactionDate}`
          );
          continue;
        }

        const postingDate = new Date(row.postingDate);
        if (isNaN(postingDate.getTime())) {
          result.errors.push(`Invalid posting date format: ${row.postingDate}`);
          continue;
        }

        // Parse numeric fields
        const billingAmount = parseFloat(row.billingAmount);
        if (isNaN(billingAmount)) {
          result.errors.push(`Invalid billing amount: ${row.billingAmount}`);
          continue;
        }

        const lineAmount = parseFloat(row.lineAmount);
        if (isNaN(lineAmount)) {
          result.errors.push(`Invalid line amount: ${row.lineAmount}`);
          continue;
        }

        const lineNumber = parseInt(row.lineNumber, 10);
        if (isNaN(lineNumber)) {
          result.errors.push(`Invalid line number: ${row.lineNumber}`);
          continue;
        }

        // Prepare transaction data
        const transactionData = {
          transactionReference: row.transactionReference,
          cardholderName: row.cardHolderName,
          lastFourDigits: row.lastFourDigits,
          transactionDate: transactionDate,
          postingDate: postingDate,
          billingAmount: billingAmount,
          lineAmount: lineAmount,
          lineNumber: lineNumber,
          glCode: row.glCode,
          glCodeDescription: row.glCodeDescription || undefined,
          reasonForExpense: row.reasonForExpense || undefined,
          receiptImageName: row.receiptImageName || undefined,
          receiptImageReferenceId: row.receiptImageReferenceId || undefined,
          supplierName: row.supplierName || undefined,
          supplierCity: row.supplierCity || undefined,
          supplierState: row.supplierState || undefined,
          workflowStatus: row.workflowStatus || undefined,
          merchantCategoryCode: row.merchantCategoryCode || undefined,
          odometerReading: row.odometerReading || undefined,
          fuelQuantity: row.fuelQuantity || undefined,
          fuelType: row.fuelType || undefined,
          fuelUnitCost: row.fuelUnitCost || undefined,
          fuelUnitOfMeasure: row.fuelUnitOfMeasure || undefined,
        };

        transactionsToInsert.push(transactionData);
      } catch (error) {
        result.errors.push(`Error processing row: ${error}`);
      }
    }

    // Step 2: Bulk insert transactions
    if (transactionsToInsert.length > 0) {
      try {
        const createdTransactions = await createManyTransactions(
          transactionsToInsert
        );
        result.transactionsCreated = createdTransactions.length;
      } catch (error) {
        // Handle unique constraint violations (duplicates in database)
        if (
          error instanceof Error &&
          error.message.includes("unique constraint")
        ) {
          // For now, count as duplicates - in production you might want more sophisticated handling
          result.duplicatesSkipped += transactionsToInsert.length;
          result.errors.push(`Some transactions already exist in the database`);
        } else {
          result.errors.push(`Failed to insert transactions: ${error}`);
        }
      }
    }

    return result;
  } catch (error) {
    result.errors.push(
      `Unexpected error processing transaction data: ${error}`
    );
    return result;
  }
}
