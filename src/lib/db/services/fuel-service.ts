import { eq, and } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { FuelCSVRow } from "@/lib/validations/fuel";

export interface ProcessedFuelData {
  driversCreated: number;
  transactionsCreated: number;
  insertedIds: string[];
  errors: string[];
}

export async function processFuelCSVData(
  rows: FuelCSVRow[]
): Promise<ProcessedFuelData> {
  const result: ProcessedFuelData = {
    driversCreated: 0,
    transactionsCreated: 0,
    insertedIds: [],
    errors: [],
  };

  try {
    await db.transaction(async (trx) => {
      console.log("-------- FUEL TRANSACTION STARTED --------");
      console.log(`💾 Processing ${rows.length} fuel transactions...`);

      // Step 1: Create drivers for unique driver-branch combinations
      const uniqueDrivers = new Map<string, { name: string; branch: string }>();
      const driverMap = new Map<string, string>(); // name-branch -> driverId

      for (const row of rows) {
        if (!row.driver || !row.vehicleId) {
          result.errors.push(
            `Missing driver or vehicle data: ${JSON.stringify(row)}`
          );
          continue;
        }

        // Extract branch from vehicleId (assuming format like "NYC-123")
        const branch = row.vehicleId.split("-")[0] || "UNKNOWN";
        const driverKey = `${row.driver}-${branch}`;

        if (!uniqueDrivers.has(driverKey)) {
          uniqueDrivers.set(driverKey, {
            name: row.driver,
            branch: branch,
          });
        }
      }

      // Create drivers using Drizzle ORM with transaction support
      for (const [key, driverData] of uniqueDrivers) {
        try {
          // First check if driver exists using Drizzle query
          const existingDriver = await trx.query.drivers.findFirst({
            where: and(
              eq(schema.drivers.name, driverData.name),
              eq(schema.drivers.branch, driverData.branch)
            ),
          });

          let driverId: string;

          if (existingDriver) {
            driverId = existingDriver.id;
            console.log(
              `✓ Found existing driver: ${driverData.name} (${driverData.branch})`
            );
          } else {
            // Create new driver using Drizzle insert
            const insertResult = await trx
              .insert(schema.drivers)
              .values({
                name: driverData.name,
                branch: driverData.branch,
              })
              .returning({ id: schema.drivers.id });

            driverId = insertResult[0].id;
            result.driversCreated++;
            console.log(
              `✓ Created driver: ${driverData.name} (${driverData.branch}) - ID: ${driverId}`
            );
          }

          driverMap.set(key, driverId);
        } catch (error) {
          result.errors.push(
            `Failed to create driver ${driverData.name}: ${error}`
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
          const branch = row.vehicleId.split("-")[0] || "UNKNOWN";
          const driverKey = `${row.driver}-${branch}`;
          const driverId = driverMap.get(driverKey);

          if (!driverId) {
            result.errors.push(
              `Driver not found for: ${row.driver} in branch ${branch}`
            );
            continue;
          }

          // Parse date
          const transactionDate = new Date(row.date);
          if (isNaN(transactionDate.getTime())) {
            result.errors.push(`Invalid date format: ${row.date}`);
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
            .insert(schema.fuelTransactions)
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
            .returning({ id: schema.fuelTransactions.id });

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
