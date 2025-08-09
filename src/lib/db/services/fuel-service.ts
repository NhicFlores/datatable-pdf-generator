import { Fuel_CSV_Row } from "@/lib/types";
import { createDriverIfNotExists } from "../mutations/drivers";
import { createManyFuelTransactions } from "../mutations/fuel-transactions";

/**
 * Service layer for fuel transaction business logic
 */

export interface ProcessedFuelData {
  driversCreated: number;
  transactionsCreated: number;
  errors: string[];
}

export async function processFuelCSVData(
  data: Fuel_CSV_Row[]
): Promise<ProcessedFuelData> {
  const result: ProcessedFuelData = {
    driversCreated: 0,
    transactionsCreated: 0,
    errors: [],
  };

  if (!data || data.length === 0) {
    result.errors.push("No data provided");
    return result;
  }

  try {
    // Step 1: Extract unique drivers and create them
    const uniqueDrivers = new Map<string, { name: string; branch: string }>();

    for (const row of data) {
      if (!row.driver || !row.vehicleId) {
        result.errors.push(
          `Missing driver or vehicle data in row: ${JSON.stringify(row)}`
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

    // Create drivers
    const driverMap = new Map<string, string>(); // name-branch -> driverId

    for (const [key, driverData] of uniqueDrivers) {
      try {
        const driver = await createDriverIfNotExists(
          driverData.name,
          driverData.branch
        );
        driverMap.set(key, driver.id);
        result.driversCreated++;
      } catch (error) {
        result.errors.push(
          `Failed to create driver ${driverData.name}: ${error}`
        );
      }
    }

    // Step 2: Process fuel transactions
    const transactionsToInsert = [];

    for (const row of data) {
      try {
        // Validate required fields
        if (!row.driver || !row.vehicleId || !row.date || !row.invoiceNumber) {
          result.errors.push(
            `Missing required fields in row: ${JSON.stringify(row)}`
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

        transactionsToInsert.push({
          vehicleId: row.vehicleId,
          driverId: driverId,
          date: transactionDate,
          invoiceNumber: row.invoiceNumber,
          gallons: row.gallons || 0,
          cost: row.cost || 0,
          sellerState: row.sellerState || "",
          sellerName: row.sellerName || "",
          odometer: row.odometer || 0,
          receipt: row.receipt || "",
        });
      } catch (error) {
        result.errors.push(`Error processing row: ${error}`);
      }
    }

    // Step 3: Bulk insert fuel transactions
    if (transactionsToInsert.length > 0) {
      try {
        const createdTransactions = await createManyFuelTransactions(
          transactionsToInsert
        );
        result.transactionsCreated = createdTransactions.length;
      } catch (error) {
        result.errors.push(`Failed to insert fuel transactions: ${error}`);
      }
    }

    return result;
  } catch (error) {
    result.errors.push(`Unexpected error processing fuel data: ${error}`);
    return result;
  }
}
