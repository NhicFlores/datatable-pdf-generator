"use client";
import { DataTable } from "@/components/tables/data-table";
import { createTransactionColumns } from "@/components/tables/transaction-columns";
import { createFuelLogColumns } from "@/components/tables/fuel-log-columns";
import { FilterTabs } from "@/components/filter-tabs";
import { CreateFuelLogButton } from "@/components/create-fuel-log-button";
import { WeekSelector } from "@/components/week-selector";
import { Button } from "@/components/ui/button";
import {
  updateFuelLogFieldAction,
  addTransactionToDriverLogsAction,
} from "@/lib/actions/fuel-actions";
import { Eye, EyeOff } from "lucide-react";
import React, { useMemo, useState, useCallback, useTransition } from "react";
import { 
  generateWeeksForQuarter, 
  getCurrentWeek,
  type WeekRange 
} from "@/lib/utils/week-utils";
import { parseISO, isWithinInterval } from "date-fns";
import type {
  SelectTransaction,
  SelectFuelLog,
} from "@/lib/data-model/schema-types";
import type {
  DriverTransactions,
  DriverLogs,
} from "@/lib/data-model/query-types";

interface FuelReportDetailProps {
  driverLogs: DriverLogs;
  driverTransactions: DriverTransactions | null;
  quarterStartDate?: Date; // Optional for backward compatibility
  quarterEndDate?: Date;   // Optional for backward compatibility
}

export function FuelReportDetail({
  driverLogs,
  driverTransactions,
  quarterStartDate,
  quarterEndDate,
}: FuelReportDetailProps) {
  const [, startTransition] = useTransition();

  // Generate weeks for the quarter (if dates are provided)
  const weeks = useMemo(() => {
    if (!quarterStartDate || !quarterEndDate) return [];
    return generateWeeksForQuarter(quarterStartDate, quarterEndDate);
  }, [quarterStartDate, quarterEndDate]);

  // Week filter state
  const [selectedWeek, setSelectedWeek] = useState<WeekRange | null>(() => {
    return weeks.length > 0 ? getCurrentWeek(weeks) : null;
  });

  // Server Action wrapper for updating fuel transaction fields
  const handleUpdateFuelLogField = useCallback(
    (
      fuelLogId: string, // Now expects actual database UUID
      field: keyof SelectFuelLog,
      value: string | number
    ) => {
      startTransition(async () => {
        const result = await updateFuelLogFieldAction(
          fuelLogId, // Pass the actual UUID to server action
          field,
          value
        );
        if (!result.success) {
          console.error("Failed to update fuel transaction:", result.error);
          // TODO: Add proper error handling/toast notification
        }
      });
    },
    []
  );

  // Server Action wrapper for adding transactions to fuel report
  const handleAddTransactionToDriverLogs = useCallback(
    (transaction: SelectTransaction) => {
      if (!driverLogs) return;

      startTransition(async () => {
        // Directly pass the modern SelectTransaction to the Server Action
        const result = await addTransactionToDriverLogsAction(
          driverLogs.driverId,
          transaction
        );
        if (!result.success) {
          console.error(
            "Failed to add transaction to fuel logs:",
            result.error
          );
          // TODO: Add proper error handling/toast notification
        }
      });
    },
    [driverLogs]
  );

  // Filter states for each table
  const [statementFilter, setStatementFilter] = useState<
    "all" | "matched" | "unmatched"
  >("unmatched");
  const [transactionFilter, setTransactionFilter] = useState<
    "all" | "matched" | "unmatched"
  >("unmatched");

  // State to control transaction table visibility
  const [isTransactionTableVisible, setIsTransactionTableVisible] = useState<boolean>(true);

  // State to track temporarily removed transactions during audit
  const [removedTransactionIds, setRemovedTransactionIds] = useState<
    Set<string>
  >(new Set());

  // Get all transactions for the driver
  const allTransactions = useMemo(() => {
    return driverTransactions?.transactions || [];
  }, [driverTransactions]);

  // Function to remove transaction from audit view
  const handleRemoveTransaction = useCallback(
    (transactionReference: string) => {
      setRemovedTransactionIds(
        (prev) => new Set([...prev, transactionReference])
      );
    },
    []
  );

  // Function to restore all removed transactions
  const handleRestoreTransactions = useCallback(() => {
    setRemovedTransactionIds(new Set());
  }, []);

  // Week filter handler
  const handleWeekChange = useCallback((week: WeekRange | null) => {
    setSelectedWeek(week);
  }, []);

  // Helper function to check if a date is within the selected week
  const isDateInSelectedWeek = useCallback((date: Date | string | null): boolean => {
    if (!selectedWeek || !date) return true; // Show all if no week selected or no date
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return isWithinInterval(dateObj, {
        start: selectedWeek.startDate,
        end: selectedWeek.endDate,
      });
    } catch {
      return true; // Show item if date parsing fails
    }
  }, [selectedWeek]);

  // Get matching transaction IDs for highlighting (now from server)
  const matchingFuelLogIds = useMemo(() => {
    return driverTransactions?.matchedFuelLogIds || new Set<string>();
  }, [driverTransactions]);

  const matchingTransactionIds = useMemo(() => {
    return driverTransactions?.matchedTransactionIds || new Set<string>();
  }, [driverTransactions]);

  // Base filtered transactions (week + exclusions only, no tab filter)
  const baseFilteredTransactions = useMemo(() => {
    if (!allTransactions.length) return [];

    const activeTransactions = allTransactions.filter(
      (t) => !removedTransactionIds.has(t.transactionReference)
    );

    // Apply week filter only
    return selectedWeek 
      ? activeTransactions.filter(t => isDateInSelectedWeek(t.transactionDate))
      : activeTransactions;
  }, [
    allTransactions,
    removedTransactionIds,
    selectedWeek,
    isDateInSelectedWeek,
  ]);

  // Filtered transactions for the expense statement view (base + tab filter)
  const filteredStatementTransactions = useMemo(() => {
    // Apply match filter to base filtered data
    switch (statementFilter) {
      case "matched":
        return baseFilteredTransactions.filter(
          (t) => matchingTransactionIds.has(t.id) // Use database ID instead of reference
        );
      case "unmatched":
        return baseFilteredTransactions.filter(
          (t) => !matchingTransactionIds.has(t.id) // Use database ID instead of reference
        );
      case "all":
      default:
        return baseFilteredTransactions;
    }
  }, [
    baseFilteredTransactions,
    statementFilter,
    matchingTransactionIds,
  ]);

  // Base filtered fuel logs (week only, no tab filter)
  const baseFilteredFuelLogs = useMemo(() => {
    if (!driverLogs) return [];

    const allFuelLogs = driverLogs.fuelLogs;

    // Apply week filter only
    return selectedWeek 
      ? allFuelLogs.filter(log => isDateInSelectedWeek(log.date))
      : allFuelLogs;
  }, [driverLogs, selectedWeek, isDateInSelectedWeek]);

  // Filtered data for fuel transactions (base + tab filter)
  const filteredFuelLogs = useMemo(() => {
    // Apply match filter to base filtered data
    switch (transactionFilter) {
      case "matched":
        return baseFilteredFuelLogs.filter(
          (t) => matchingFuelLogIds.has(t.id) // Use database ID instead of composite key
        );
      case "unmatched":
        return baseFilteredFuelLogs.filter(
          (t) => !matchingFuelLogIds.has(t.id) // Use database ID instead of composite key
        );
      case "all":
      default:
        return baseFilteredFuelLogs;
    }
  }, [baseFilteredFuelLogs, transactionFilter, matchingFuelLogIds]);

  const transactionColumns = useMemo(
    () =>
      createTransactionColumns(
        matchingTransactionIds,
        handleAddTransactionToDriverLogs,
        handleRemoveTransaction
      ),
    [
      matchingTransactionIds,
      handleAddTransactionToDriverLogs,
      handleRemoveTransaction,
    ]
  );

  const fuelLogColumns = useMemo(
    () =>
      createFuelLogColumns(
        matchingFuelLogIds,
        handleUpdateFuelLogField,
        true,
        driverLogs.driverId
      ),
    [matchingFuelLogIds, handleUpdateFuelLogField, driverLogs.driverId]
  );

  return (
    <main className="container mx-auto py-10 space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {driverLogs.driverName} Fuel Report
        </h1>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span>Matched Transactions</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded"></div>
            <span>Unmatched Transactions</span>
          </div>
        </div>
      </div>

      {/* Week Filter */}
      {weeks.length > 0 && (
        <section className="flex justify-center">
          <WeekSelector
            weeks={weeks}
            currentWeek={selectedWeek}
            onWeekChange={handleWeekChange}
          />
        </section>
      )}

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Credit Transactions (Expense Statement)
            {selectedWeek && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                - {selectedWeek.label}
              </span>
            )}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTransactionTableVisible(!isTransactionTableVisible)}
            className="flex items-center gap-2"
          >
            {isTransactionTableVisible ? (
              <>
                <EyeOff className="h-4 w-4" />
                Hide Tansaction Table
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Show Tansaction Table
              </>
            )}
          </Button>
        </div>

        {isTransactionTableVisible && (
          <>
            {allTransactions.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FilterTabs
                    activeFilter={statementFilter}
                    onFilterChange={setStatementFilter}
                    totalCount={baseFilteredTransactions.length}
                    matchedCount={
                      baseFilteredTransactions.filter(
                        (t) => matchingTransactionIds.has(t.id) // Use database ID
                      ).length
                    }
                    unmatchedCount={
                      baseFilteredTransactions.filter(
                        (t) => !matchingTransactionIds.has(t.id) // Use database ID
                      ).length
                    }
                  />
                  {removedTransactionIds.size > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>
                        {removedTransactionIds.size} transactions removed from view
                      </span>
                      <button
                        onClick={handleRestoreTransactions}
                        className="text-blue-600 hover:text-blue-700 underline"
                      >
                        Restore All
                      </button>
                    </div>
                  )}
                </div>
                <DataTable
                  columns={transactionColumns}
                  data={filteredStatementTransactions}
                />
              </div>
            ) : (
              <div className="text-center text-gray-500 mt-10">
                {selectedWeek 
                  ? `No transactions found for ${selectedWeek.label}`
                  : driverTransactions
                  ? `No transactions found for ${driverTransactions.driverName}`
                  : "No transaction data available"
                }
              </div>
            )}
          </>
        )}
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Fuel Logs (Fuel Report)
            {selectedWeek && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                - {selectedWeek.label}
              </span>
            )}
          </h2>
        </div>
        {driverLogs ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FilterTabs
                activeFilter={transactionFilter}
                onFilterChange={setTransactionFilter}
                totalCount={baseFilteredFuelLogs.length}
                matchedCount={
                  baseFilteredFuelLogs.filter(
                    (t) => matchingFuelLogIds.has(t.id) // Use database ID
                  ).length
                }
                unmatchedCount={
                  baseFilteredFuelLogs.filter(
                    (t) => !matchingFuelLogIds.has(t.id) // Use database ID
                  ).length
                }
              />
              <CreateFuelLogButton driverId={driverLogs.driverId} />
            </div>
            <DataTable columns={fuelLogColumns} data={filteredFuelLogs} />
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-10">
            No fuel report selected
          </div>
        )}
      </section>
    </main>
  );
}
