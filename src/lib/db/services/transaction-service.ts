import { db, schema } from "@/lib/db";
// import { eq } from "drizzle-orm"; // Now using eq from db/index
import {
  ExpenseCSVRowSchema,
  type ExpenseCSVRow,
  type ProcessedTransactionResult,
} from "@/lib/validations/transaction";

export async function processTransactionCSVData(
  rows: ExpenseCSVRow[]
): Promise<ProcessedTransactionResult> {
  const result: ProcessedTransactionResult = {
    transactionsCreated: 0,
    driversCreated: 0,
    duplicatesSkipped: 0,
    nonDriversSkipped: 0,
    validationErrors: [],
    databaseErrors: [],
  };

  try {
    await db.transaction(async (trx) => {
      console.log("-------- TRANSACTION PROCESSING STARTED --------");
      console.log(`💾 Processing ${rows.length} transactions...`);

      // Pre-fetch all existing drivers to avoid duplicate lookups
      const existingDrivers = await trx
        .select({
          id: schema.drivers.id,
          name: schema.drivers.name,
        })
        .from(schema.drivers);

      // Create a map for fast driver lookups by name (case-insensitive)
      const driverMap = new Map<string, string>();
      existingDrivers.forEach((driver) => {
        driverMap.set(driver.name.toLowerCase().trim(), driver.id);
      });

      console.log(
        `✅ Found ${existingDrivers.length} existing drivers in database`
      );

      // Track newly created drivers to avoid duplicates within this batch
      const newDriversCreated = new Map<string, string>();

      // Helper function to get or create driver
      const getOrCreateDriver = async (
        cardholderName: string
      ): Promise<string> => {
        const normalizedName = cardholderName.toLowerCase().trim();

        // Check existing drivers first
        if (driverMap.has(normalizedName)) {
          return driverMap.get(normalizedName)!;
        }

        // Check if we already created this driver in this batch
        if (newDriversCreated.has(normalizedName)) {
          return newDriversCreated.get(normalizedName)!;
        }

        // Create new driver
        console.log(`🔄 Creating new driver: ${cardholderName}`);
        const [newDriver] = await trx
          .insert(schema.drivers)
          .values({
            name: cardholderName.trim(),
            branch: "AUTO_CREATED", // Default branch for transaction-created drivers
          })
          .returning({ id: schema.drivers.id });

        newDriversCreated.set(normalizedName, newDriver.id);
        driverMap.set(normalizedName, newDriver.id); // Add to main map too

        console.log(
          `✅ Created driver ${cardholderName} with ID: ${newDriver.id}`
        );
        return newDriver.id;
      };

      // Track processed references to detect duplicates within batch
      // const processedReferences = new Set<string>();

      for (const row of rows) {
        try {
          // Step 1: Validate row with Zod
          const validation = ExpenseCSVRowSchema.safeParse(row);
          if (!validation.success) {
            const errorMessages = validation.error.issues
              .map((err) => `${err.path.join(".")}: ${err.message}`)
              .join(", ");
            result.validationErrors.push(`Validation failed: ${errorMessages}`);
            continue;
          }

          const validRow = validation.data;

          // REF_NUMBER-LINE_NUMBER to enforce uniqueness for split transactions
          const refNumberWithLineNumber = `${validRow.transactionReference}-${
            validRow.lineNumber || "1"
          }`;

          // // Step 2: Check for duplicates within batch
          // if (processedReferences.has(validRow.transactionReference)) {
          //   result.duplicatesSkipped++;
          //   result.validationErrors.push(
          //     `Duplicate transaction reference: ${validRow.transactionReference}`
          //   );
          //   continue;
          // }
          // processedReferences.add(validRow.transactionReference);

          // Step 3: Validate required fields and constraints
          if (
            !validRow.transactionReference ||
            !validRow.cardHolderName ||
            !validRow.glCode
          ) {
            result.validationErrors.push(
              `Missing required fields: ${JSON.stringify(validRow)}`
            );
            continue;
          }

          // Step 3.1: Validate field length constraints
          if (validRow.lastFourDigits.length !== 4) {
            result.validationErrors.push(
              `Invalid last four digits length: "${validRow.lastFourDigits}" (expected 4 chars, got ${validRow.lastFourDigits.length})`
            );
            continue;
          }

          if (validRow.glCode.length > 150) {
            result.validationErrors.push(
              `GL Code too long: "${validRow.glCode}" (max 150 chars, got ${validRow.glCode.length})`
            );
            continue;
          }

          if (validRow.cardHolderName.length > 255) {
            result.validationErrors.push(
              `Cardholder name too long: "${validRow.cardHolderName}" (max 255 chars, got ${validRow.cardHolderName.length})`
            );
            continue;
          }

          // Step 4: Validate numeric fields
          if (
            typeof validRow.billingAmount !== "number" ||
            typeof validRow.lineAmount !== "number"
          ) {
            result.validationErrors.push(
              `Invalid numeric data: ${JSON.stringify(validRow)}`
            );
            continue;
          }

          // Step 5: Parse dates
          const transactionDate = new Date(validRow.transactionDate);
          const postingDate = new Date(validRow.postingDate);

          if (
            isNaN(transactionDate.getTime()) ||
            isNaN(postingDate.getTime())
          ) {
            result.validationErrors.push(
              `Invalid date format: transactionDate=${validRow.transactionDate}, postingDate=${validRow.postingDate}`
            );
            continue;
          }

          // Step 6: Check for existing transaction with same reference
          // TODO: Re-enable duplicate check after confirming INSERT works
          /*
          const existingTransaction = await trx
            .select({ id: schema.transactions.id })
            .from(schema.transactions)
            .where(
              eq(
                schema.transactions.transactionReference,
                validRow.transactionReference
              )
            )
            .limit(1);

          if (existingTransaction.length > 0) {
            console.log(
              `⚠️ Skipping duplicate transaction: ${validRow.transactionReference}`
            );
            result.duplicatesSkipped++;
            continue;
          }
          */

          // Step 7: Get or create driver for this transaction
          const driverId = await getOrCreateDriver(validRow.cardHolderName);

          // Step 8: Insert transaction using Drizzle ORM
          console.log(
            `🔄 Attempting to insert transaction: ${validRow.transactionReference}`
          );
          console.log(
            `   Data validation: cardHolderName="${validRow.cardHolderName}", driverId="${driverId}", lastFourDigits="${validRow.lastFourDigits}" (length: ${validRow.lastFourDigits.length}), lineNumber="${validRow.lineNumber}"`
          );
          console.log("");
          console.log("XXXXXXXXX");
          console.log("");
          console.log("INSERTING TRANSACTION");
          console.log("");
          console.log("XXXXXXXXX");
          console.log("");

          await trx.insert(schema.transactions).values({
            driverId: driverId,
            transactionReference: refNumberWithLineNumber,
            cardholderName: validRow.cardHolderName,
            lastFourDigits: validRow.lastFourDigits,
            transactionDate: transactionDate,
            postingDate: postingDate,
            billingAmount: validRow.billingAmount.toString(),
            lineAmount: validRow.lineAmount.toString(),
            lineNumber: validRow.lineNumber || "1",
            glCode: validRow.glCode,
            glCodeDescription: validRow.glCodeDescription || null,
            reasonForExpense: validRow.reasonForExpense || null,
            receiptImageName: validRow.receiptImageName || null,
            receiptImageReferenceId: validRow.receiptImageReferenceId || null,
            supplierName: validRow.supplierName || null,
            supplierCity: validRow.supplierCity || null,
            supplierState: validRow.supplierState || null,
            workflowStatus: validRow.workflowStatus || null,
            merchantCategoryCode: validRow.merchantCategoryCode || null,
            odometerReading: validRow.odometerReading?.toString() || null,
            fuelQuantity: validRow.fuelQuantity?.toString() || null,
            fuelType: validRow.fuelType || null,
            fuelUnitCost: validRow.fuelUnitCost?.toString() || null,
            fuelUnitOfMeasure: validRow.fuelUnitOfMeasure || null,
          });
          // .returning({ id: schema.transactions.id });

          result.transactionsCreated++;
          // console.log(
          //   `✓ Inserted transaction: ${validRow.transactionReference} - ID: ${insertResult[0].id}`
          // );
        } catch (error) {
          // Log detailed error for debugging
          const errorDetails = {
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : "No stack trace",
            name: error instanceof Error ? error.name : "Unknown",
            code: (error as { code?: string })?.code || "No code",
            detail: (error as { detail?: string })?.detail || "No detail",
            constraint:
              (error as { constraint?: string })?.constraint || "No constraint",
            table: (error as { table?: string })?.table || "No table",
            column: (error as { column?: string })?.column || "No column",
          };

          console.error(`❌ Failed to insert transaction:`, {
            errorDetails,
            rowData: JSON.stringify(row),
          });

          result.databaseErrors.push(
            `Failed to insert transaction: ${errorDetails.message} (Code: ${errorDetails.code}, Detail: ${errorDetails.detail})`
          );

          // Continue with next row instead of aborting entire transaction
          continue;
        }
      }

      console.log(
        `✅ Transaction processing complete: ${result.transactionsCreated} transactions created`
      );

      // Update result with driver creation count
      result.driversCreated = newDriversCreated.size;

      // Add summary of newly created drivers to result
      console.log(`📊 Transaction processing summary:`);
      console.log(`   • Transactions created: ${result.transactionsCreated}`);
      console.log(`   • New drivers created: ${result.driversCreated}`);
      console.log(`   • Existing drivers used: ${existingDrivers.length}`);

      if (newDriversCreated.size > 0) {
        console.log(
          `   • New driver names: ${Array.from(newDriversCreated.keys()).join(
            ", "
          )}`
        );
      }

      console.log("-------- TRANSACTION PROCESSING COMPLETED --------");
    });
  } catch (error) {
    console.error("💥 Database transaction failed:", error);
    result.databaseErrors.push(
      `Database transaction failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  return result;
}
