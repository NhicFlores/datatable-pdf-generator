"use server";

import { db, schema } from "@/lib/db";
import { desc, eq, sql, and } from "drizzle-orm";
import { cache } from "react";
import type {
  SelectTransaction,
  SelectDriver,
  SelectFuelLog,
} from "@/lib/data-model/schema-types";
import type {
  FuelReport,
  FuelLogWithDriver,
  FuelReportSummary,
  DriverTransactions,
  FuelSummaryData,
  FuelSummaryByState,
  FuelSummaryByVehicle,
  FuelSummaryTableData,
  FuelSummaryRow,
} from "../data-model/query-types";

// Re-export types for convenience
export type { SelectTransaction, SelectDriver, SelectFuelLog };

// Export new query types for convenience
export type {
  FuelReport,
  FuelLogWithDriver,
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

export const getFuelLogsFromDB = cache(
  async (): Promise<FuelLogWithDriver[]> => {
    try {
      console.log("🔍 Fetching fuel transactions from database...");

      const fuelLogs = await db
        .select({
          id: schema.fuelLogs.id,
          vehicleId: schema.fuelLogs.vehicleId,
          driverId: schema.fuelLogs.driverId,
          date: schema.fuelLogs.date,
          invoiceNumber: schema.fuelLogs.invoiceNumber,
          gallons: schema.fuelLogs.gallons,
          cost: schema.fuelLogs.cost,
          sellerState: schema.fuelLogs.sellerState,
          sellerName: schema.fuelLogs.sellerName,
          odometer: schema.fuelLogs.odometer,
          receipt: schema.fuelLogs.receipt,
          createdAt: schema.fuelLogs.createdAt,
          updatedAt: schema.fuelLogs.updatedAt,
          // Include driver information
          driverName: schema.drivers.name,
          driverBranch: schema.drivers.branch,
        })
        .from(schema.fuelLogs)
        .leftJoin(
          schema.drivers,
          eq(schema.fuelLogs.driverId, schema.drivers.id)
        );

      console.log(
        `✅ Fetched ${fuelLogs.length} fuel transactions from database`
      );
      return fuelLogs;
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
    const [drivers, fuelLogs] = await Promise.all([
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
          id: schema.fuelLogs.id,
          vehicleId: schema.fuelLogs.vehicleId,
          driverId: schema.fuelLogs.driverId,
          date: schema.fuelLogs.date,
          invoiceNumber: schema.fuelLogs.invoiceNumber,
          gallons: schema.fuelLogs.gallons,
          cost: schema.fuelLogs.cost,
          sellerState: schema.fuelLogs.sellerState,
          sellerName: schema.fuelLogs.sellerName,
          odometer: schema.fuelLogs.odometer,
          receipt: schema.fuelLogs.receipt,
        })
        .from(schema.fuelLogs)
        .orderBy(schema.fuelLogs.date),
    ]);

    // Use Maps and Sets for efficient grouping and deduplication
    const fuelLogsByDriver = new Map<string, typeof fuelLogs>();
    const vehicleSetsByDriver = new Map<string, Set<string>>();

    // Single pass through fuel transactions for grouping and vehicle collection
    fuelLogs.forEach((fuelLog) => {
      const { driverId, vehicleId } = fuelLog;

      // Group fuel transactions by driver
      if (!fuelLogsByDriver.has(driverId)) {
        fuelLogsByDriver.set(driverId, []);
      }
      fuelLogsByDriver.get(driverId)!.push(fuelLog);

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
      fuelLogs: fuelLogsByDriver.get(driver.id) || [],
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
            sql<string>`STRING_AGG(DISTINCT ${schema.fuelLogs.vehicleId}, ',')`.as(
              "vehicle_ids"
            ),
        })
        .from(schema.drivers)
        .leftJoin(
          schema.fuelLogs,
          eq(schema.drivers.id, schema.fuelLogs.driverId)
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

      const [driver, fuelLogs] = await Promise.all([
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
            id: schema.fuelLogs.id,
            vehicleId: schema.fuelLogs.vehicleId,
            driverId: schema.fuelLogs.driverId,
            date: schema.fuelLogs.date,
            invoiceNumber: schema.fuelLogs.invoiceNumber,
            gallons: schema.fuelLogs.gallons,
            cost: schema.fuelLogs.cost,
            sellerState: schema.fuelLogs.sellerState,
            sellerName: schema.fuelLogs.sellerName,
            odometer: schema.fuelLogs.odometer,
            receipt: schema.fuelLogs.receipt,
          })
          .from(schema.fuelLogs)
          .where(eq(schema.fuelLogs.driverId, driverId))
          .orderBy(desc(schema.fuelLogs.date)),
      ]);

      if (!driver[0]) {
        console.log(`❌ Driver not found with ID: ${driverId}`);
        return null;
      }

      // Collect unique vehicle IDs
      const vehicleIds = [...new Set(fuelLogs.map((t) => t.vehicleId))];

      const fuelReport: FuelReport = {
        id: driver[0].id,
        name: driver[0].name,
        branch: driver[0].branch,
        vehicleIds,
        fuelLogs: fuelLogs,
      };

      console.log(
        `✅ Fetched fuel report for ${driver[0].name} with ${fuelLogs.length} transactions`
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
 * Now includes server-side matching data
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

      // Get transactions matching the driver's name and active matches in parallel
      const [transactions, matches] = await Promise.all([
        db
          .select()
          .from(schema.transactions)
          .where(eq(schema.transactions.cardholderName, driver[0].name))
          .orderBy(desc(schema.transactions.transactionDate)),

        // Get active matches for this driver
        db
          .select({
            transactionId: schema.transactionFuelMatches.transactionId,
            fuelLogId: schema.transactionFuelMatches.fuelLogId,
            matchType: schema.transactionFuelMatches.matchType,
            confidence: schema.transactionFuelMatches.confidence,
            isActive: schema.transactionFuelMatches.isActive,
          })
          .from(schema.transactionFuelMatches)
          .innerJoin(
            schema.fuelLogs,
            eq(schema.transactionFuelMatches.fuelLogId, schema.fuelLogs.id)
          )
          .where(
            and(
              eq(schema.fuelLogs.driverId, driverId),
              eq(schema.transactionFuelMatches.isActive, true)
            )
          ),
      ]);

      // Build matching data sets
      const matchedTransactionIds = new Set(
        matches.map((m) => m.transactionId)
      );
      const matchedFuelLogIds = new Set(matches.map((m) => m.fuelLogId));
      const matchSummaries = matches.map((m) => ({
        transactionId: m.transactionId,
        fuelLogId: m.fuelLogId,
        matchType: m.matchType,
        confidence: parseFloat(m.confidence),
        isActive: m.isActive,
      }));

      const result: DriverTransactions = {
        driverId: driver[0].id,
        driverName: driver[0].name,
        transactions,
        matchedTransactionIds,
        matchedFuelLogIds,
        matches: matchSummaries,
      };

      console.log(
        `✅ Fetched ${transactions.length} transactions and ${matches.length} matches for driver ${driver[0].name}`
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
            totalTransactions: sql<number>`COUNT(${schema.fuelLogs.id})`.as(
              "total_transactions"
            ),
            totalGallons:
              sql<number>`COALESCE(SUM(CAST(${schema.fuelLogs.gallons} AS DECIMAL)), 0)`.as(
                "total_gallons"
              ),
            totalCost:
              sql<number>`COALESCE(SUM(CAST(${schema.fuelLogs.cost} AS DECIMAL)), 0)`.as(
                "total_cost"
              ),
          })
          .from(schema.drivers)
          .leftJoin(
            schema.fuelLogs,
            eq(schema.drivers.id, schema.fuelLogs.driverId)
          ),

        // Statistics by state
        db
          .select({
            state: schema.fuelLogs.sellerState,
            totalGallons:
              sql<number>`SUM(CAST(${schema.fuelLogs.gallons} AS DECIMAL))`.as(
                "total_gallons"
              ),
            totalCost:
              sql<number>`SUM(CAST(${schema.fuelLogs.cost} AS DECIMAL))`.as(
                "total_cost"
              ),
            transactionCount: sql<number>`COUNT(${schema.fuelLogs.id})`.as(
              "transaction_count"
            ),
            uniqueVehicles:
              sql<number>`COUNT(DISTINCT ${schema.fuelLogs.vehicleId})`.as(
                "unique_vehicles"
              ),
          })
          .from(schema.fuelLogs)
          .groupBy(schema.fuelLogs.sellerState)
          .orderBy(schema.fuelLogs.sellerState),

        // Statistics by vehicle
        db
          .select({
            vehicleId: schema.fuelLogs.vehicleId,
            driverName: schema.drivers.name,
            totalGallons:
              sql<number>`SUM(CAST(${schema.fuelLogs.gallons} AS DECIMAL))`.as(
                "total_gallons"
              ),
            totalCost:
              sql<number>`SUM(CAST(${schema.fuelLogs.cost} AS DECIMAL))`.as(
                "total_cost"
              ),
            transactionCount: sql<number>`COUNT(${schema.fuelLogs.id})`.as(
              "transaction_count"
            ),
          })
          .from(schema.fuelLogs)
          .leftJoin(
            schema.drivers,
            eq(schema.fuelLogs.driverId, schema.drivers.id)
          )
          .groupBy(schema.fuelLogs.vehicleId, schema.drivers.name)
          .orderBy(schema.fuelLogs.vehicleId),
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
      const fuelLogs = await db
        .select({
          sellerState: schema.fuelLogs.sellerState,
          vehicleId: schema.fuelLogs.vehicleId,
          gallons: schema.fuelLogs.gallons,
        })
        .from(schema.fuelLogs)
        .where(sql`${schema.fuelLogs.sellerState} IS NOT NULL`)
        .orderBy(schema.fuelLogs.sellerState);

      // Get unique truck IDs and states
      const uniqueTruckIds = [
        ...new Set(fuelLogs.map((t) => t.vehicleId).filter(Boolean)),
      ].sort();

      const uniqueStates = [
        ...new Set(fuelLogs.map((t) => t.sellerState).filter(Boolean)),
      ].sort();

      // Create summary rows for each state
      const summaryRows: FuelSummaryRow[] = uniqueStates.map((state) => {
        // Filter transactions for current state
        const stateFuelLogs = fuelLogs.filter((t) => t.sellerState === state);

        // Calculate total gallons for this state
        const totalGallons = stateFuelLogs.reduce(
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
        stateFuelLogs.forEach((t) => {
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
