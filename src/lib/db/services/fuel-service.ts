import { eq, and, or } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { FuelCSVRow } from "@/lib/validations/fuel";

export interface ProcessedFuelData {
  driversCreated: number;
  transactionsCreated: number;
  insertedIds: string[];
  errors: string[];
  skippedDuplicates: number;
}

export async function processFuelCSVData(
  rows: FuelCSVRow[]
): Promise<ProcessedFuelData> {
  const result: ProcessedFuelData = {
    driversCreated: 0,
    transactionsCreated: 0,
    insertedIds: [],
    errors: [],
    skippedDuplicates: 0,
  };

  try {
    await db.transaction(async (trx) => {
      console.log("-------- FUEL TRANSACTION STARTED --------");
      console.log(`💾 Processing ${rows.length} fuel transactions...`);

      // Step 1: Create drivers for unique driver names
      const uniqueDrivers = new Set<string>();
      const driverMap = new Map<string, string>(); // name -> driverId
      for (const row of rows) {
        if (!row.driver || !row.vehicleId) {
          result.errors.push(
            `Missing driver or vehicle data: ${JSON.stringify(row)}`
          );
          continue;
        }

        uniqueDrivers.add(row.driver);
      }
      // Create drivers using Drizzle ORM with transaction support
      for (const driverName of uniqueDrivers) {
        try {
          // First check if driver exists using Drizzle query
          const existingDriver = await trx.query.drivers.findFirst({
            where: eq(schema.drivers.name, driverName)
          });

          let driverId: string;

          if (existingDriver) {
            driverId = existingDriver.id;
            console.log(
              `✓ Found existing driver: ${driverName}`
            );
          } else {
            // Extract branch from first vehicle with this driver for new driver creation
            const sampleRow = rows.find(row => row.driver === driverName);
            const branch = sampleRow?.vehicleId.split("-")[0] || "UNKNOWN";

            // Create new driver using Drizzle insert
            const insertResult = await trx
              .insert(schema.drivers)
              .values({
                name: driverName,
                branch: branch,
              })
              .returning({ id: schema.drivers.id });

            driverId = insertResult[0].id;
            result.driversCreated++;
            console.log(
              `✓ Created driver: ${driverName} (${branch}) - ID: ${driverId}`
            );
          }

          driverMap.set(driverName, driverId);
        } catch (error) {
          result.errors.push(
            `Failed to create driver ${driverName}: ${error}`
          );
        }
      }

      // Step 2: Insert fuel transactions using raw SQL with RETURNING
      for (const row of rows) {
        try {
          // Validate required fields
          if (
            !row.driver ||
            !row.vehicleId ||
            !row.date ||
            !row.invoiceNumber
          ) {
            result.errors.push(
              `Missing required fields: ${JSON.stringify(row)}`
            );
            continue;
          }

          // Validate numeric fields
          if (typeof row.gallons !== "number" || typeof row.cost !== "number") {
            result.errors.push(
              `Invalid numeric data in row: ${JSON.stringify(row)}`
            );
            continue;
          }

          // Get driver ID
          const driverId = driverMap.get(row.driver);

          if (!driverId) {
            result.errors.push(
              `Driver not found: ${row.driver}`
            );
            continue;
          }

          // Parse date
          const transactionDate = new Date(row.date);
          if (isNaN(transactionDate.getTime())) {
            result.errors.push(`Invalid date format: ${row.date}`);
            continue;
          }

          const isDuplicate = await checkFuelLogExists(driverId, transactionDate, row.odometer ?? 0, row.cost);

          if (isDuplicate){
            result.skippedDuplicates++;
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

          const insertResult = await trx
            .insert(schema.fuelLogs)
            .values({
              vehicleId: row.vehicleId,
              driverId: driverId,
              date: transactionDate,
              invoiceNumber: row.invoiceNumber,
              gallons: row.gallons.toString(), // Convert to string for decimal
              cost: row.cost.toString(), // Convert to string for decimal
              sellerState: row.sellerState || "UNKNOWN STATE", // Provide default for required field
              sellerName: row.sellerName || "UNKNOWN NAME", // Provide default for required field
              odometer: row.odometer?.toString() || "0.000",
              receipt: row.receipt || null, // Optional field can be null
            })
            .returning({ id: schema.fuelLogs.id });

          const transactionId = insertResult[0].id;
          result.insertedIds.push(transactionId);
          result.transactionsCreated++;

          console.log(
            `✓ Inserted fuel transaction: ${row.invoiceNumber} - ID: ${transactionId}`
          );
        } catch (error) {
          result.errors.push(`Failed to insert fuel transaction: ${error}`);
          console.error(`❌ Failed to insert: ${row.invoiceNumber}`, error);
        }
      }

      console.log(
        `✅ Fuel transaction processing complete: ${result.transactionsCreated} transactions, ${result.driversCreated} drivers`
      );
      console.log("-------- FUEL TRANSACTION COMPLETED --------");
    });
  } catch (error) {
    console.error("💥 Database transaction failed:", error);
    result.errors.push(
      `Database transaction failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  return result;
}

async function checkFuelLogExists(driverId: string, date: Date, odometer: number, amount: number): Promise<boolean> {
  try {
    const existingLog = await db.query.fuelLogs.findFirst({
      where: or(
      and(
        eq(schema.fuelLogs.driverId, driverId),
        eq(schema.fuelLogs.date, date),
        eq(schema.fuelLogs.odometer, odometer.toString())
      ), 
      and(
        eq(schema.fuelLogs.driverId, driverId),
        eq(schema.fuelLogs.date, date),
        eq(schema.fuelLogs.cost, amount.toString()))
      )
    })

    return !!existingLog;
  } catch (error) {
    console.error("Error checking existing fuel log:", error);
    return false;
  }
}