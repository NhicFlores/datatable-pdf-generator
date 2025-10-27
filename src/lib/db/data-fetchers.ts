"use server";

import { db, schema } from "@/lib/db";
import { desc, eq, sql, and, between } from "drizzle-orm";
import { cache } from "react";
import type {
  SelectTransaction,
  SelectDriver,
  SelectFuelLog,
} from "@/lib/data-model/schema-types";
import type {
  FuelReport,
  FuelReportSummary,
  DriverTransactions,
  FuelSummaryTableData,
  FuelSummaryRow,
  DriverLogs,
} from "../data-model/query-types";
import { findMatchesForTransactions } from "./services/matching-service";
import type { QuarterDateRange } from "@/lib/actions/quarter-data-actions";

// Re-export types for convenience
export type { SelectTransaction, SelectDriver, SelectFuelLog };

// Export new query types for convenience
export type {
  FuelReport,
  FuelReportSummary,
  DriverTransactions,
  FuelSummaryTableData,
  FuelSummaryRow,
} from "../data-model/query-types";

// Server-side data fetchers with caching

// =============================================================================
// NEW OPTIMIZED DATA FETCHERS FOR SERVER COMPONENT ARCHITECTURE
// =============================================================================

/**
 * Get lightweight fuel report summaries for list page
 * Returns basic driver info + aggregated stats without full transaction data
 */
export const getFuelReportSummariesFromDB = cache(
  async (dateRange?: QuarterDateRange | null): Promise<FuelReportSummary[]> => {
    try {
      console.log("🔍 Fetching fuel report summaries from database...");

      if (dateRange) {
        console.log(
          `📅 Filtering by date range: ${dateRange.startDate.toISOString()} - ${dateRange.endDate.toISOString()}`
        );
      }

      const query = db
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
          dateRange
            ? and(
                eq(schema.drivers.id, schema.fuelLogs.driverId),
                between(
                  schema.fuelLogs.date,
                  dateRange.startDate,
                  dateRange.endDate
                )
              )
            : eq(schema.drivers.id, schema.fuelLogs.driverId)
        )
        .groupBy(
          schema.drivers.id,
          schema.drivers.name,
          schema.drivers.branch,
          schema.drivers.createdAt,
          schema.drivers.updatedAt
        )
        .orderBy(schema.drivers.name);

      const summaries = await query;

      // Transform the comma-delimited string into an array
      const transformedSummaries = summaries.map((summary) => ({
        ...summary,
        vehicleIds: summary.vehicleIds
          ? summary.vehicleIds.split(",").filter(Boolean)
          : [],
      }));

      console.log(
        `✅ Fetched ${transformedSummaries.length} fuel report summaries${
          dateRange ? ` for date range` : ""
        }`
      );
      return transformedSummaries;
    } catch (error) {
      console.error("❌ Failed to fetch fuel report summaries:", error);
      return [];
    }
  }
);

/**
 * CONSOLIDATED: Get complete fuel report detail data for a driver
 * Replaces getFuelReportByIdFromDB + getTransactionsByDriverFromDB
 * Uses single query with joins for optimal performance
 */
export const getFuelReportDetailFromDB = cache(
  async (
    driverId: string,
    dateRange?: QuarterDateRange | null
  ): Promise<{
    driverLogs: DriverLogs | null;
    driverTransactions: DriverTransactions | null;
  }> => {
    try {
      console.log(
        `🔍 Fetching complete fuel report detail for driver ID: ${driverId}${
          dateRange ? ` for date range` : ""
        }`
      );

      if (dateRange) {
        console.log(
          `📅 Filtering by date range: ${dateRange.startDate.toISOString()} - ${dateRange.endDate.toISOString()}`
        );
      }
      // NOTE TODO: simplify query by removing driver query and just using transactions FK 
      // Single comprehensive query using Drizzle's relational query API
      const result = await db.query.drivers.findFirst({
        where: eq(schema.drivers.id, driverId),
        with: {
          fuelLogs: {
            where: dateRange
              ? between(
                  schema.fuelLogs.date,
                  dateRange.startDate,
                  dateRange.endDate
                )
              : undefined,
            orderBy: [desc(schema.fuelLogs.date)],
          },
        },
      });

      if (!result) {
        console.log(`❌ Driver not found with ID: ${driverId}`);
        return { driverLogs: null, driverTransactions: null };
      }

      // Get transactions using the FK relationship (much faster than string matching)
      const transactions = await db
        .select()
        .from(schema.transactions)
        .where(
          dateRange
            ? and(
                eq(schema.transactions.driverId, driverId),
                between(
                  schema.transactions.transactionDate,
                  dateRange.startDate,
                  dateRange.endDate
                )
              )
            : eq(schema.transactions.driverId, driverId)
        )
        .orderBy(desc(schema.transactions.transactionDate));

      console.log(
        `📋 Fetched ${result.fuelLogs.length} fuel logs and ${transactions.length} transactions`
      );

      // Perform on-demand matching using fresh data
      console.log("🔍 Running on-demand matching...");
      const freshMatches = findMatchesForTransactions(
        transactions,
        result.fuelLogs
      );

      console.log(`✅ Found ${freshMatches.length} fresh matches`);

      // Build fuel report
      const driverLogs: DriverLogs = {
        driverId: result.id,
        driverName: result.name,
        fuelLogs: result.fuelLogs,
      };

      // Build matching data sets from fresh matches
      const matchedTransactionIds = new Set(
        freshMatches.map((m) => m.transactionId)
      );
      const matchedFuelLogIds = new Set(freshMatches.map((m) => m.fuelLogId));
      const matchSummaries = freshMatches.map((m) => ({
        transactionId: m.transactionId,
        fuelLogId: m.fuelLogId,
        matchType: m.matchType,
        confidence: m.confidence,
        isActive: true, // Fresh matches are always active
      }));

      // Build driver transactions
      const driverTransactions: DriverTransactions = {
        driverId: result.id,
        driverName: result.name,
        transactions,
        matchedTransactionIds,
        matchedFuelLogIds,
        matches: matchSummaries,
      };

      console.log(
        `✅ Fetched complete data: ${result.fuelLogs.length} fuel logs, ${transactions.length} transactions, ${freshMatches.length} fresh matches`
      );

      return { driverLogs, driverTransactions };
    } catch (error) {
      console.error(
        `❌ Failed to fetch fuel report detail for driver ${driverId}:`,
        error
      );
      return { driverLogs: null, driverTransactions: null };
    }
  }
);

/**
 * OPTIMIZED: Get filtered fuel report data with server-side filtering
 * Reduces client-side computation and network transfer
 */
export const getFilteredFuelReportDetailFromDB = cache(
  async (
    driverId: string,
    filters?: {
      statementFilter?: "all" | "matched" | "unmatched";
      transactionFilter?: "all" | "matched" | "unmatched";
    }
  ): Promise<{
    driverLogs: DriverLogs | null;
    driverTransactions: DriverTransactions | null;
    stats: {
      totalFuelLogs: number;
      matchedFuelLogs: number;
      totalTransactions: number;
      matchedTransactions: number;
    };
  }> => {
    try {
      console.log(`🔍 Fetching filtered data for driver ${driverId}:`, filters);

      // Get base data first
      const { driverLogs, driverTransactions } =
        await getFuelReportDetailFromDB(driverId);

      if (!driverLogs || !driverTransactions) {
        return {
          driverLogs: null,
          driverTransactions: null,
          stats: {
            totalFuelLogs: 0,
            matchedFuelLogs: 0,
            totalTransactions: 0,
            matchedTransactions: 0,
          },
        };
      }

      // Calculate stats before filtering
      const stats = {
        totalFuelLogs: driverLogs.fuelLogs.length,
        matchedFuelLogs: driverTransactions.matchedFuelLogIds.size,
        totalTransactions: driverTransactions.transactions.length,
        matchedTransactions: driverTransactions.matchedTransactionIds.size,
      };

      // If no filters specified, return full data with stats
      if (
        !filters ||
        (filters.statementFilter === "all" &&
          filters.transactionFilter === "all")
      ) {
        return { driverLogs, driverTransactions, stats };
      }

      // Apply server-side filtering
      let filteredTransactions = driverTransactions.transactions;
      let filteredFuelLogs = driverLogs.fuelLogs;

      // Filter transactions based on match status
      if (filters.statementFilter === "matched") {
        filteredTransactions = driverTransactions.transactions.filter((t) =>
          driverTransactions.matchedTransactionIds.has(t.id)
        );
      } else if (filters.statementFilter === "unmatched") {
        filteredTransactions = driverTransactions.transactions.filter(
          (t) => !driverTransactions.matchedTransactionIds.has(t.id)
        );
      }

      // Filter fuel logs based on match status
      if (filters.transactionFilter === "matched") {
        filteredFuelLogs = driverLogs.fuelLogs.filter((f) =>
          driverTransactions.matchedFuelLogIds.has(f.id)
        );
      } else if (filters.transactionFilter === "unmatched") {
        filteredFuelLogs = driverLogs.fuelLogs.filter(
          (f) => !driverTransactions.matchedFuelLogIds.has(f.id)
        );
      }

      // Create filtered versions
      const filteredDriverLogs: DriverLogs = {
        ...driverLogs,
        fuelLogs: filteredFuelLogs,
      };

      const filteredDriverTransactions: DriverTransactions = {
        ...driverTransactions,
        transactions: filteredTransactions,
      };

      console.log(
        `✅ Applied filters - Transactions: ${filteredTransactions.length}/${driverTransactions.transactions.length}, Fuel Logs: ${filteredFuelLogs.length}/${driverLogs.fuelLogs.length}`
      );

      return {
        driverLogs: filteredDriverLogs,
        driverTransactions: filteredDriverTransactions,
        stats,
      };
    } catch (error) {
      console.error(
        `❌ Failed to fetch filtered data for driver ${driverId}:`,
        error
      );
      return {
        driverLogs: null,
        driverTransactions: null,
        stats: {
          totalFuelLogs: 0,
          matchedFuelLogs: 0,
          totalTransactions: 0,
          matchedTransactions: 0,
        },
      };
    }
  }
);

/**
 * DEPRECATED: Use getFuelReportDetailFromDB instead
 * Keeping for backward compatibility during transition
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
          .select()
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
 * DEPRECATED: Use getFuelReportDetailFromDB instead
 * Keeping for backward compatibility during transition
 * Get transactions for specific driver by FK relationship
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

      // Get transactions using driverId foreign key and active matches in parallel
      const [transactions, matches] = await Promise.all([
        db
          .select()
          .from(schema.transactions)
          .where(eq(schema.transactions.driverId, driverId))
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
 * Get fuel summary table data for summary page
 * Returns data structured to match the deprecated FuelSummaryData format
 */
export const getFuelSummaryTableFromDB = cache(
  async (dateRange?: QuarterDateRange | null): Promise<FuelSummaryTableData> => {
    try {
      console.log("🔍 Fetching fuel summary table data from database...");

      if (dateRange) {
        console.log(
          `📅 Filtering fuel summary data by date range: ${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`
        );
      }

      // Build where conditions
      const whereConditions = [
        sql`${schema.fuelLogs.sellerState} IS NOT NULL`
      ];

      // Add date range filter if provided
      if (dateRange) {
        whereConditions.push(
          between(
            schema.fuelLogs.date,
            dateRange.startDate,
            dateRange.endDate
          )
        );
      }

      // Get all fuel transactions with state and vehicle data
      const fuelLogs = await db
        .select({
          sellerState: schema.fuelLogs.sellerState,
          vehicleId: schema.fuelLogs.vehicleId,
          gallons: schema.fuelLogs.gallons,
        })
        .from(schema.fuelLogs)
        .where(and(...whereConditions))
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

/**
 * Get all fuel logs for a specific quarter (for CSV export)
 * Returns raw fuel log data for export purposes
 */
export const getAllFuelLogsForQuarter = cache(
  async (dateRange: QuarterDateRange): Promise<Array<{
    id: string;
    vehicleId: string;
    driverId: string;
    driver: string | null;
    date: Date;
    invoiceNumber: string;
    gallons: string;
    cost: string;
    sellerState: string;
    sellerName: string;
    odometer: string;
    receipt: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>> => {
    try {
      console.log("🔍 Fetching all fuel logs for quarter export...");
      console.log(
        `📅 Date range: ${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`
      );

      // Fetch all fuel logs within the date range with driver names
      const fuelLogs = await db
        .select({
          id: schema.fuelLogs.id,
          vehicleId: schema.fuelLogs.vehicleId,
          driverId: schema.fuelLogs.driverId,
          driver: schema.drivers.name, // Get driver name from joined table
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
        })
        .from(schema.fuelLogs)
        .leftJoin(schema.drivers, eq(schema.fuelLogs.driverId, schema.drivers.id))
        .where(
          between(
            schema.fuelLogs.date,
            dateRange.startDate,
            dateRange.endDate
          )
        )
        .orderBy(desc(schema.fuelLogs.date), schema.fuelLogs.vehicleId);

      console.log(`✅ Retrieved ${fuelLogs.length} fuel log records for export`);
      return fuelLogs;
    } catch (error) {
      console.error("❌ Failed to fetch fuel logs for quarter export:", error);
      return [];
    }
  }
);
