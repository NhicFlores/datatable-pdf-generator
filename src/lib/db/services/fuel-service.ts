import { eq, and, or, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { FuelCSVRow } from "@/lib/validations/fuel";
import { startOfDay, format } from "date-fns";
import { extractDbError, toUserMessage } from "@/lib/db/errors";
import type { UploadRowError } from "@/lib/data-model/upload-types";

export interface ProcessedFuelData {
  driversCreated: number;
  transactionsCreated: number;
  insertedIds: string[];
  errors: UploadRowError[];
  skippedDuplicates: number;
  // True only once the outer database transaction has committed. When false,
  // nothing was persisted and all counts are zero.
  committed: boolean;
}

export interface ProcessFuelOptions {
  /** Original 1-based row numbers for `rows` (rows that failed validation are not in `rows`) */
  rowNumbers?: number[];
  /** Included in logs so they can be matched to the API response */
  requestId?: string;
}

const rowLabel = (row: FuelCSVRow) =>
  `vehicle ${row.vehicleId}, invoice ${row.invoiceNumber}`;

export async function processFuelCSVData(
  rows: FuelCSVRow[],
  options: ProcessFuelOptions = {}
): Promise<ProcessedFuelData> {
  const logTag = options.requestId ? `[${options.requestId}]` : "";
  const rowNumberOf = (index: number) => options.rowNumbers?.[index] ?? index + 1;

  const result: ProcessedFuelData = {
    driversCreated: 0,
    transactionsCreated: 0,
    insertedIds: [],
    errors: [],
    skippedDuplicates: 0,
    committed: false,
  };

  // Counts are collected here and only copied to `result` after the commit,
  // so a failed/rolled-back transaction never reports rows as created.
  const pending = { driversCreated: 0, insertedIds: [] as string[], skippedDuplicates: 0 };

  try {
    await db.transaction(async (trx) => {
      console.log("-------- FUEL TRANSACTION STARTED --------");
      console.log(`💾 Processing ${rows.length} fuel transactions...`);

      // Step 1: Create drivers for unique driver names
      const uniqueDrivers = new Set<string>();
      const driverMap = new Map<string, string>(); // name -> driverId
      for (const [index, row] of rows.entries()) {
        if (!row.driver || !row.vehicleId) {
          result.errors.push({
            stage: "insert",
            rowNumber: rowNumberOf(index),
            message: "Missing driver or vehicle data",
          });
          continue;
        }

        uniqueDrivers.add(row.driver);
      }
      // Create drivers using Drizzle ORM with transaction support
      for (const driverName of uniqueDrivers) {
        try {
          // Savepoint: a failure here rolls back only this driver, not the whole upload
          const { driverId, created } = await trx.transaction(async (sp) => {
            // First check if driver exists using Drizzle query
            const existingDriver = await sp.query.drivers.findFirst({
              where: eq(schema.drivers.name, driverName)
            });

            if (existingDriver) {
              console.log(
                `✓ Found existing driver: ${driverName}`
              );
              return { driverId: existingDriver.id, created: false };
            }

            // Extract branch from first vehicle with this driver for new driver creation
            const sampleRow = rows.find(row => row.driver === driverName);
            const branch = sampleRow?.vehicleId.split("-")[0] || "UNKNOWN";

            // Create new driver using Drizzle insert
            const insertResult = await sp
              .insert(schema.drivers)
              .values({
                name: driverName,
                branch: branch,
              })
              .returning({ id: schema.drivers.id });

            console.log(
              `✓ Created driver: ${driverName} (${branch}) - ID: ${insertResult[0].id}`
            );
            return { driverId: insertResult[0].id, created: true };
          });

          if (created) pending.driversCreated++;
          driverMap.set(driverName, driverId);
        } catch (error) {
          const dbError = extractDbError(error);
          console.error(`❌ ${logTag} Failed to create driver: ${driverName}`, dbError);
          result.errors.push({
            stage: "driver",
            label: `driver ${driverName}`,
            code: dbError.code,
            message: `Failed to create driver: ${toUserMessage(dbError)}`,
          });
        }
      }

      // Step 2: Insert fuel transactions using raw SQL with RETURNING
      for (const [index, row] of rows.entries()) {
        const rowNumber = rowNumberOf(index);
        try {
          // Validate required fields
          if (
            !row.driver ||
            !row.vehicleId ||
            !row.date ||
            !row.invoiceNumber
          ) {
            result.errors.push({
              stage: "insert",
              rowNumber,
              message: "Missing required fields",
            });
            continue;
          }

          // Validate numeric fields
          if (typeof row.gallons !== "number" || typeof row.cost !== "number") {
            result.errors.push({
              stage: "insert",
              rowNumber,
              label: rowLabel(row),
              message: "Invalid numeric data",
            });
            continue;
          }

          // Get driver ID
          const driverId = driverMap.get(row.driver);

          if (!driverId) {
            result.errors.push({
              stage: "insert",
              rowNumber,
              label: rowLabel(row),
              message: `Driver not found: ${row.driver}`,
            });
            continue;
          }

          // Parse date and normalize to start of day for consistent duplicate checking
          const transactionDate = new Date(row.date);
          if (isNaN(transactionDate.getTime())) {
            result.errors.push({
              stage: "insert",
              rowNumber,
              label: rowLabel(row),
              field: "date",
              message: `Invalid date format: ${row.date}`,
            });
            continue;
          }
          
          // Normalize to start of day to ensure date-only comparison
          const normalizedDate = startOfDay(transactionDate);
          
          console.log('📅 DATE PROCESSING:', {
            original: row.date,
            parsed: transactionDate.toISOString(),
            normalized: normalizedDate.toISOString(),
            dateString: format(normalizedDate, 'yyyy-MM-dd')
          });

          const isDuplicate = await checkFuelLogExists(driverId, normalizedDate, row.odometer ?? 0, row.cost);

          if (isDuplicate){
            pending.skippedDuplicates++;
            console.log(`Skipping duplicate fuel log for driver ${row.driver} on ${row.date}`);
            continue; 
          }

          // Insert fuel transaction using Drizzle ORM
          console.log(
            `🔄 Attempting to insert fuel transaction: ${row.invoiceNumber}`
          );
          console.log(
            `   Data: gallons=${row.gallons}, cost=${row.cost}, odometer=${row.odometer}`
          );

          // Savepoint: a failed insert rolls back only this row. Without it,
          // Postgres aborts the whole transaction and every later row fails
          // with "current transaction is aborted" (25P02).
          const insertResult = await trx.transaction((sp) =>
            sp
              .insert(schema.fuelLogs)
              .values({
                vehicleId: row.vehicleId,
                driverId: driverId,
                date: normalizedDate, // Use normalized date for consistent storage
                invoiceNumber: row.invoiceNumber,
                gallons: row.gallons.toString(), // Convert to string for decimal
                cost: row.cost.toString(), // Convert to string for decimal
                sellerState: row.sellerState || "UNKNOWN STATE", // Provide default for required field
                sellerName: row.sellerName || "UNKNOWN NAME", // Provide default for required field
                odometer: row.odometer?.toString() || "0.000",
                receipt: row.receipt || null, // Optional field can be null
              })
              .returning({ id: schema.fuelLogs.id })
          );

          const transactionId = insertResult[0].id;
          pending.insertedIds.push(transactionId);

          console.log(
            `✓ Inserted fuel transaction: ${row.invoiceNumber} - ID: ${transactionId}`
          );
        } catch (error) {
          const dbError = extractDbError(error);
          console.error(
            `❌ ${logTag} Row ${rowNumber} failed (${rowLabel(row)}, date ${row.date})`,
            {
              ...dbError,
              gallons: row.gallons,
              cost: row.cost,
              odometer: row.odometer,
            }
          );
          result.errors.push({
            stage: "insert",
            rowNumber,
            label: rowLabel(row),
            code: dbError.code,
            message: toUserMessage(dbError),
          });
        }
      }

      console.log(
        `✅ Fuel transaction processing complete: ${pending.insertedIds.length} transactions, ${pending.driversCreated} drivers`
      );
      console.log("-------- FUEL TRANSACTION COMPLETED --------");
    });

    // Reached only if the outer transaction committed
    result.committed = true;
    result.driversCreated = pending.driversCreated;
    result.insertedIds = pending.insertedIds;
    result.transactionsCreated = pending.insertedIds.length;
    result.skippedDuplicates = pending.skippedDuplicates;
  } catch (error) {
    const dbError = extractDbError(error);
    console.error(`💥 ${logTag} Database transaction failed:`, dbError, error);
    result.errors.push({
      stage: "transaction",
      code: dbError.code,
      message: `Database transaction failed, no rows were saved: ${toUserMessage(dbError)}`,
    });
  }

  return result;
}

async function checkFuelLogExists(driverId: string, date: Date, odometer: number, amount: number): Promise<boolean> {
  try {
    const existingLog = await db.query.fuelLogs.findFirst({
      where: or(
      and(
        eq(schema.fuelLogs.driverId, driverId),
        eq(sql`DATE(${schema.fuelLogs.date})`, format(date, 'yyyy-MM-dd')),
        eq(schema.fuelLogs.odometer, odometer.toString())
      ), 
      and(
        eq(schema.fuelLogs.driverId, driverId),
        eq(sql`DATE(${schema.fuelLogs.date})`, format(date, 'yyyy-MM-dd')),
        eq(schema.fuelLogs.cost, amount.toString()))
      )
    })

    return !!existingLog;
  } catch (error) {
    console.error("Error checking existing fuel log:", error);
    return false;
  }
}