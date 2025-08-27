"use server";

import { db, schema } from "@/lib/db";
import { desc, eq, sql } from "drizzle-orm";
import { cache } from "react";
import type {
  SelectTransaction,
  SelectDriver,
  SelectFuelTransaction,
} from "@/lib/data-model/schema-types";
import type {
  FuelReport,
  FuelTransactionWithDriver,
  FuelReportSummary,
  DriverTransactions,
  FuelSummaryData,
  FuelSummaryByState,
  FuelSummaryByVehicle,
  FuelSummaryTableData,
  FuelSummaryRow,
} from "../data-model/query-types";

// Re-export types for convenience
export type { SelectTransaction, SelectDriver, SelectFuelTransaction };

// Export new query types for convenience
export type {
  FuelReport,
  FuelTransactionWithDriver,
  FuelReportSummary,
  DriverTransactions,
  FuelSummaryData,
  FuelSummaryByState,
  FuelSummaryByVehicle,
  FuelSummaryTableData,
  FuelSummaryRow,
} from "../data-model/query-types";

// Server-side data fetchers with caching

export const getTransactionsFromDB = cache(
  async (): Promise<SelectTransaction[]> => {
    try {
      console.log("🔍 Fetching transactions from database...");

      const transactions = await db
        .select()
        .from(schema.transactions)
        .orderBy(desc(schema.transactions.transactionDate));

      console.log(
        `✅ Fetched ${transactions.length} transactions from database`
      );
      return transactions;
    } catch (error) {
      console.error("❌ Failed to fetch transactions from database:", error);
      return [];
    }
  }
);

export const getFuelTransactionsFromDB = cache(
  async (): Promise<FuelTransactionWithDriver[]> => {
    try {
      console.log("🔍 Fetching fuel transactions from database...");

      const fuelTransactions = await db
        .select({
          id: schema.fuelTransactions.id,
          vehicleId: schema.fuelTransactions.vehicleId,
          driverId: schema.fuelTransactions.driverId,
          date: schema.fuelTransactions.date,
          invoiceNumber: schema.fuelTransactions.invoiceNumber,
          gallons: schema.fuelTransactions.gallons,
          cost: schema.fuelTransactions.cost,
          sellerState: schema.fuelTransactions.sellerState,
          sellerName: schema.fuelTransactions.sellerName,
          odometer: schema.fuelTransactions.odometer,
          receipt: schema.fuelTransactions.receipt,
          createdAt: schema.fuelTransactions.createdAt,
          updatedAt: schema.fuelTransactions.updatedAt,
          // Include driver information
          driverName: schema.drivers.name,
          driverBranch: schema.drivers.branch,
        })
        .from(schema.fuelTransactions)
        .leftJoin(
          schema.drivers,
          eq(schema.fuelTransactions.driverId, schema.drivers.id)
        );

      console.log(
        `✅ Fetched ${fuelTransactions.length} fuel transactions from database`
      );
      return fuelTransactions;
    } catch (error) {
      console.error(
        "❌ Failed to fetch fuel transactions from database:",
        error
      );
      return [];
    }
  }
);

export const getDriversFromDB = cache(async (): Promise<SelectDriver[]> => {
  try {
    console.log("🔍 Fetching drivers from database...");

    const drivers = await db
      .select()
      .from(schema.drivers)
      .orderBy(schema.drivers.name);

    console.log(`✅ Fetched ${drivers.length} drivers from database`);
    return drivers;
  } catch (error) {
    console.error("❌ Failed to fetch drivers from database:", error);
    return [];
  }
});

export const getFuelReportsFromDB = cache(async (): Promise<FuelReport[]> => {
  try {
    console.log("🔍 Fetching fuel reports from database...");

    // Fetch drivers and fuel transactions in parallel for better performance
    const [drivers, fuelTransactions] = await Promise.all([
      db
        .select({
          id: schema.drivers.id,
          name: schema.drivers.name,
          branch: schema.drivers.branch,
        })
        .from(schema.drivers)
        .orderBy(schema.drivers.name),

      db
        .select({
          id: schema.fuelTransactions.id,
          vehicleId: schema.fuelTransactions.vehicleId,
          driverId: schema.fuelTransactions.driverId,
          date: schema.fuelTransactions.date,
          invoiceNumber: schema.fuelTransactions.invoiceNumber,
          gallons: schema.fuelTransactions.gallons,
          cost: schema.fuelTransactions.cost,
          sellerState: schema.fuelTransactions.sellerState,
          sellerName: schema.fuelTransactions.sellerName,
          odometer: schema.fuelTransactions.odometer,
          receipt: schema.fuelTransactions.receipt,
        })
        .from(schema.fuelTransactions)
        .orderBy(schema.fuelTransactions.date),
    ]);

    // Use Maps and Sets for efficient grouping and deduplication
    const fuelTransactionsByDriver = new Map<string, typeof fuelTransactions>();
    const vehicleSetsByDriver = new Map<string, Set<string>>();

    // Single pass through fuel transactions for grouping and vehicle collection
    fuelTransactions.forEach((transaction) => {
      const { driverId, vehicleId } = transaction;

      // Group fuel transactions by driver
      if (!fuelTransactionsByDriver.has(driverId)) {
        fuelTransactionsByDriver.set(driverId, []);
      }
      fuelTransactionsByDriver.get(driverId)!.push(transaction);

      // Collect unique vehicle IDs per driver using Set for O(1) lookups
      if (vehicleId) {
        if (!vehicleSetsByDriver.has(driverId)) {
          vehicleSetsByDriver.set(driverId, new Set());
        }
        vehicleSetsByDriver.get(driverId)!.add(vehicleId);
      }
    });

    // Combine drivers with their fuel transactions and vehicle IDs
    const fuelReports: FuelReport[] = drivers.map((driver) => ({
      id: driver.id,
      name: driver.name,
      branch: driver.branch,
      vehicleIds: Array.from(vehicleSetsByDriver.get(driver.id) || []),
      fuelTransactions: fuelTransactionsByDriver.get(driver.id) || [],
    }));

    console.log(`✅ Fetched ${fuelReports.length} fuel reports from database`);
    return fuelReports;
  } catch (error) {
    console.error("❌ Failed to fetch fuel reports from database:", error);
    return [];
  }
});

// =============================================================================
// NEW OPTIMIZED DATA FETCHERS FOR SERVER COMPONENT ARCHITECTURE
// =============================================================================

/**
 * Get lightweight fuel report summaries for list page
 * Returns basic driver info + aggregated stats without full transaction data
 */
export const getFuelReportSummariesFromDB = cache(
  async (): Promise<FuelReportSummary[]> => {
    try {
      console.log("🔍 Fetching fuel report summaries from database...");

      const summaries = await db
        .select({
          id: schema.drivers.id,
          name: schema.drivers.name,
          branch: schema.drivers.branch,
          createdAt: schema.drivers.createdAt,
          updatedAt: schema.drivers.updatedAt,
          vehicleIds:
            sql<string>`STRING_AGG(DISTINCT ${schema.fuelTransactions.vehicleId}, ',')`.as(
              "vehicle_ids"
            ),
        })
        .from(schema.drivers)
        .leftJoin(
          schema.fuelTransactions,
          eq(schema.drivers.id, schema.fuelTransactions.driverId)
        )
        .groupBy(
          schema.drivers.id,
          schema.drivers.name,
          schema.drivers.branch,
          schema.drivers.createdAt,
          schema.drivers.updatedAt
        )
        .orderBy(schema.drivers.name);

      // Transform the comma-delimited string into an array
      const transformedSummaries = summaries.map((summary) => ({
        ...summary,
        vehicleIds: summary.vehicleIds
          ? summary.vehicleIds.split(",").filter(Boolean)
          : [],
      }));

      console.log(
        `✅ Fetched ${transformedSummaries.length} fuel report summaries`
      );
      return transformedSummaries;
    } catch (error) {
      console.error("❌ Failed to fetch fuel report summaries:", error);
      return [];
    }
  }
);

/**
 * Get single fuel report by driver ID for detail page
 * Returns complete fuel report with all transactions for specific driver
 */
export const getFuelReportByIdFromDB = cache(
  async (driverId: string): Promise<FuelReport | null> => {
    try {
      console.log(`🔍 Fetching fuel report for driver ID: ${driverId}`);

      const [driver, fuelTransactions] = await Promise.all([
        db
          .select({
            id: schema.drivers.id,
            name: schema.drivers.name,
            branch: schema.drivers.branch,
          })
          .from(schema.drivers)
          .where(eq(schema.drivers.id, driverId))
          .limit(1),

        db
          .select({
            id: schema.fuelTransactions.id,
            vehicleId: schema.fuelTransactions.vehicleId,
            driverId: schema.fuelTransactions.driverId,
            date: schema.fuelTransactions.date,
            invoiceNumber: schema.fuelTransactions.invoiceNumber,
            gallons: schema.fuelTransactions.gallons,
            cost: schema.fuelTransactions.cost,
            sellerState: schema.fuelTransactions.sellerState,
            sellerName: schema.fuelTransactions.sellerName,
            odometer: schema.fuelTransactions.odometer,
            receipt: schema.fuelTransactions.receipt,
          })
          .from(schema.fuelTransactions)
          .where(eq(schema.fuelTransactions.driverId, driverId))
          .orderBy(desc(schema.fuelTransactions.date)),
      ]);

      if (!driver[0]) {
        console.log(`❌ Driver not found with ID: ${driverId}`);
        return null;
      }

      // Collect unique vehicle IDs
      const vehicleIds = [...new Set(fuelTransactions.map((t) => t.vehicleId))];

      const fuelReport: FuelReport = {
        id: driver[0].id,
        name: driver[0].name,
        branch: driver[0].branch,
        vehicleIds,
        fuelTransactions,
      };

      console.log(
        `✅ Fetched fuel report for ${driver[0].name} with ${fuelTransactions.length} transactions`
      );
      return fuelReport;
    } catch (error) {
      console.error(
        `❌ Failed to fetch fuel report for driver ${driverId}:`,
        error
      );
      return null;
    }
  }
);

/**
 * Get transactions for specific driver by matching cardholder name
 * Used for comparison analysis on detail pages
 */
export const getTransactionsByDriverFromDB = cache(
  async (driverId: string): Promise<DriverTransactions | null> => {
    try {
      console.log(`🔍 Fetching transactions for driver ID: ${driverId}`);

      // First get the driver info
      const driver = await db
        .select({
          id: schema.drivers.id,
          name: schema.drivers.name,
        })
        .from(schema.drivers)
        .where(eq(schema.drivers.id, driverId))
        .limit(1);

      if (!driver[0]) {
        console.log(`❌ Driver not found with ID: ${driverId}`);
        return null;
      }

      // Then get transactions matching the driver's name
      const transactions = await db
        .select()
        .from(schema.transactions)
        .where(eq(schema.transactions.cardholderName, driver[0].name))
        .orderBy(desc(schema.transactions.transactionDate));

      const result: DriverTransactions = {
        driverId: driver[0].id,
        driverName: driver[0].name,
        transactions,
      };

      console.log(
        `✅ Fetched ${transactions.length} transactions for driver ${driver[0].name}`
      );
      return result;
    } catch (error) {
      console.error(
        `❌ Failed to fetch transactions for driver ${driverId}:`,
        error
      );
      return null;
    }
  }
);

/**
 * Get aggregated fuel summary data for dashboard/summary page
 * Returns high-level statistics across all drivers and states
 */
export const getFuelSummaryFromDB = cache(
  async (): Promise<FuelSummaryData> => {
    try {
      console.log("🔍 Fetching fuel summary data from database...");

      const [overallStats, stateStats, vehicleStats] = await Promise.all([
        // Overall statistics
        db
          .select({
            totalDrivers: sql<number>`COUNT(DISTINCT ${schema.drivers.id})`.as(
              "total_drivers"
            ),
            totalTransactions:
              sql<number>`COUNT(${schema.fuelTransactions.id})`.as(
                "total_transactions"
              ),
            totalGallons:
              sql<number>`COALESCE(SUM(CAST(${schema.fuelTransactions.gallons} AS DECIMAL)), 0)`.as(
                "total_gallons"
              ),
            totalCost:
              sql<number>`COALESCE(SUM(CAST(${schema.fuelTransactions.cost} AS DECIMAL)), 0)`.as(
                "total_cost"
              ),
          })
          .from(schema.drivers)
          .leftJoin(
            schema.fuelTransactions,
            eq(schema.drivers.id, schema.fuelTransactions.driverId)
          ),

        // Statistics by state
        db
          .select({
            state: schema.fuelTransactions.sellerState,
            totalGallons:
              sql<number>`SUM(CAST(${schema.fuelTransactions.gallons} AS DECIMAL))`.as(
                "total_gallons"
              ),
            totalCost:
              sql<number>`SUM(CAST(${schema.fuelTransactions.cost} AS DECIMAL))`.as(
                "total_cost"
              ),
            transactionCount:
              sql<number>`COUNT(${schema.fuelTransactions.id})`.as(
                "transaction_count"
              ),
            uniqueVehicles:
              sql<number>`COUNT(DISTINCT ${schema.fuelTransactions.vehicleId})`.as(
                "unique_vehicles"
              ),
          })
          .from(schema.fuelTransactions)
          .groupBy(schema.fuelTransactions.sellerState)
          .orderBy(schema.fuelTransactions.sellerState),

        // Statistics by vehicle
        db
          .select({
            vehicleId: schema.fuelTransactions.vehicleId,
            driverName: schema.drivers.name,
            totalGallons:
              sql<number>`SUM(CAST(${schema.fuelTransactions.gallons} AS DECIMAL))`.as(
                "total_gallons"
              ),
            totalCost:
              sql<number>`SUM(CAST(${schema.fuelTransactions.cost} AS DECIMAL))`.as(
                "total_cost"
              ),
            transactionCount:
              sql<number>`COUNT(${schema.fuelTransactions.id})`.as(
                "transaction_count"
              ),
          })
          .from(schema.fuelTransactions)
          .leftJoin(
            schema.drivers,
            eq(schema.fuelTransactions.driverId, schema.drivers.id)
          )
          .groupBy(schema.fuelTransactions.vehicleId, schema.drivers.name)
          .orderBy(schema.fuelTransactions.vehicleId),
      ]);

      const summaryData: FuelSummaryData = {
        totalDrivers: overallStats[0]?.totalDrivers || 0,
        totalTransactions: overallStats[0]?.totalTransactions || 0,
        totalGallons: overallStats[0]?.totalGallons || 0,
        totalCost: overallStats[0]?.totalCost || 0,
        summaryByState: stateStats as FuelSummaryByState[],
        summaryByVehicle: vehicleStats as FuelSummaryByVehicle[],
      };

      console.log("✅ Fetched fuel summary data successfully");
      return summaryData;
    } catch (error) {
      console.error("❌ Failed to fetch fuel summary data:", error);
      return {
        totalDrivers: 0,
        totalTransactions: 0,
        totalGallons: 0,
        totalCost: 0,
        summaryByState: [],
        summaryByVehicle: [],
      };
    }
  }
);

/**
 * Get fuel summary table data for summary page
 * Returns data structured to match the deprecated FuelSummaryData format
 */
export const getFuelSummaryTableFromDB = cache(
  async (): Promise<FuelSummaryTableData> => {
    try {
      console.log("🔍 Fetching fuel summary table data from database...");

      // Get all fuel transactions with state and vehicle data
      const fuelTransactions = await db
        .select({
          sellerState: schema.fuelTransactions.sellerState,
          vehicleId: schema.fuelTransactions.vehicleId,
          gallons: schema.fuelTransactions.gallons,
        })
        .from(schema.fuelTransactions)
        .where(sql`${schema.fuelTransactions.sellerState} IS NOT NULL`)
        .orderBy(schema.fuelTransactions.sellerState);

      // Get unique truck IDs and states
      const uniqueTruckIds = [
        ...new Set(fuelTransactions.map((t) => t.vehicleId).filter(Boolean)),
      ].sort();

      const uniqueStates = [
        ...new Set(fuelTransactions.map((t) => t.sellerState).filter(Boolean)),
      ].sort();

      // Create summary rows for each state
      const summaryRows: FuelSummaryRow[] = uniqueStates.map((state) => {
        // Filter transactions for current state
        const stateTransactions = fuelTransactions.filter(
          (t) => t.sellerState === state
        );

        // Calculate total gallons for this state
        const totalGallons = stateTransactions.reduce(
          (sum, t) => sum + (parseFloat(t.gallons) || 0),
          0
        );

        // Calculate gallons per truck ID for this state
        const truckGallons: { [truckId: string]: number } = {};

        // Initialize all truck IDs with 0
        uniqueTruckIds.forEach((truckId) => {
          truckGallons[truckId] = 0;
        });

        // Sum gallons for each truck in this state
        stateTransactions.forEach((t) => {
          if (t.vehicleId && t.gallons) {
            truckGallons[t.vehicleId] =
              (truckGallons[t.vehicleId] || 0) + parseFloat(t.gallons);
          }
        });

        return {
          state,
          totalGallons,
          truckGallons,
        };
      });

      const summaryTableData: FuelSummaryTableData = {
        summaryRows,
        uniqueTruckIds,
      };

      console.log(
        `✅ Fetched fuel summary table data with ${summaryRows.length} states and ${uniqueTruckIds.length} trucks`
      );
      return summaryTableData;
    } catch (error) {
      console.error("❌ Failed to fetch fuel summary table data:", error);
      return {
        summaryRows: [],
        uniqueTruckIds: [],
      };
    }
  }
);
