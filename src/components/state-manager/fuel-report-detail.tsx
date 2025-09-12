"use client";
import { DataTable } from "@/components/tables/data-table";
import { createTransactionColumns } from "@/components/tables/transaction-columns";
import { createFuelLogColumns } from "@/components/tables/fuel-log-columns";
import { FilterTabs } from "@/components/filter-tabs";
import { CreateFuelLogButton } from "@/components/create-fuel-log-button";
import {
  updateFuelLogFieldAction,
  addTransactionToDriverLogsAction,
} from "@/lib/actions/fuel-actions";
import React, { useMemo, useState, useCallback, useTransition } from "react";
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
}

export function FuelReportDetail({
  driverLogs,
  driverTransactions,
}: FuelReportDetailProps) {
  const [, startTransition] = useTransition();

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

  // Get matching transaction IDs for highlighting (now from server)
  const matchingFuelLogIds = useMemo(() => {
    return driverTransactions?.matchedFuelLogIds || new Set<string>();
  }, [driverTransactions]);

  const matchingTransactionIds = useMemo(() => {
    return driverTransactions?.matchedTransactionIds || new Set<string>();
  }, [driverTransactions]);

  // Filtered transactions for the expense statement view
  const filteredStatementTransactions = useMemo(() => {
    if (!allTransactions.length) return [];

    const activeTransactions = allTransactions.filter(
      (t) => !removedTransactionIds.has(t.transactionReference)
    );

    switch (statementFilter) {
      case "matched":
        return activeTransactions.filter(
          (t) => matchingTransactionIds.has(t.id) // Use database ID instead of reference
        );
      case "unmatched":
        return activeTransactions.filter(
          (t) => !matchingTransactionIds.has(t.id) // Use database ID instead of reference
        );
      case "all":
      default:
        return activeTransactions;
    }
  }, [
    allTransactions,
    statementFilter,
    matchingTransactionIds,
    removedTransactionIds,
  ]);

  // Filtered data for fuel transactions
  const filteredFuelLogs = useMemo(() => {
    if (!driverLogs) return [];

    const allFuelLogs = driverLogs.fuelLogs;

    switch (transactionFilter) {
      case "matched":
        return allFuelLogs.filter(
          (t) => matchingFuelLogIds.has(t.id) // Use database ID instead of composite key
        );
      case "unmatched":
        return allFuelLogs.filter(
          (t) => !matchingFuelLogIds.has(t.id) // Use database ID instead of composite key
        );
      case "all":
      default:
        return allFuelLogs;
    }
  }, [driverLogs, matchingFuelLogIds, transactionFilter]);

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

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Fuel Transactions (Expense Statement)
          </h2>
        </div>

        {allTransactions.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FilterTabs
                activeFilter={statementFilter}
                onFilterChange={setStatementFilter}
                totalCount={
                  allTransactions.filter(
                    (t) => !removedTransactionIds.has(t.transactionReference)
                  ).length
                }
                matchedCount={
                  allTransactions.filter(
                    (t) =>
                      matchingTransactionIds.has(t.id) && // Use database ID
                      !removedTransactionIds.has(t.transactionReference)
                  ).length
                }
                unmatchedCount={
                  allTransactions.filter(
                    (t) =>
                      !matchingTransactionIds.has(t.id) && // Use database ID
                      !removedTransactionIds.has(t.transactionReference)
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
            {driverTransactions
              ? `No transactions found for ${driverTransactions.driverName}`
              : "No transaction data available"}
          </div>
        )}
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            All Fuel Transactions (Fuel Report)
          </h2>
        </div>
        {driverLogs ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FilterTabs
                activeFilter={transactionFilter}
                onFilterChange={setTransactionFilter}
                totalCount={driverLogs.fuelLogs.length}
                matchedCount={
                  driverLogs.fuelLogs.filter(
                    (t) => matchingFuelLogIds.has(t.id) // Use database ID
                  ).length
                }
                unmatchedCount={
                  driverLogs.fuelLogs.filter(
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
