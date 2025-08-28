"use client";
import { DataTable } from "@/components/tables/data-table";
import { createTransactionColumns } from "@/components/tables/transaction-columns";
import { createFuelLogColumns } from "@/components/tables/fuel-log-columns";
import { FilterTabs } from "@/components/filter-tabs";
import {
  updateFuelLogFieldAction,
  addTransactionToFuelReportAction,
} from "@/lib/actions/fuel-actions";
import React, { useMemo, useState, useCallback, useTransition } from "react";
import type {
  SelectTransaction,
  SelectFuelLog,
} from "@/lib/data-model/schema-types";
import type {
  FuelReport,
  DriverTransactions,
} from "@/lib/data-model/query-types";

interface FuelReportDetailProps {
  fuelReport: FuelReport;
  driverTransactions: DriverTransactions | null;
}

export function FuelReportDetail({
  fuelReport,
  driverTransactions,
}: FuelReportDetailProps) {
  const [, startTransition] = useTransition();

  // Server Action wrapper for updating fuel transaction fields
  const handleUpdateFuelLogField = useCallback(
    (
      transactionId: string,
      field: keyof SelectFuelLog,
      value: string | number
    ) => {
      startTransition(async () => {
        const result = await updateFuelLogFieldAction(
          transactionId,
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
  const handleAddTransactionToFuelReport = useCallback(
    (transaction: SelectTransaction) => {
      if (!fuelReport) return;

      startTransition(async () => {
        // Directly pass the modern SelectTransaction to the Server Action
        const result = await addTransactionToFuelReportAction(
          fuelReport.id,
          transaction
        );
        if (!result.success) {
          console.error(
            "Failed to add transaction to fuel report:",
            result.error
          );
          // TODO: Add proper error handling/toast notification
        }
      });
    },
    [fuelReport]
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

  // Get matching transaction IDs for highlighting
  const matchingFuelLogIds = useMemo(() => {
    if (!fuelReport || !allTransactions.length) return new Set<string>();
    // TODO: Implement actual matching logic
    return new Set<string>(); // Placeholder during refactoring
  }, [fuelReport, allTransactions]);

  const matchingTransactionIds = useMemo(() => {
    if (!fuelReport || !allTransactions.length) return new Set<string>();
    return new Set<string>();
  }, [fuelReport, allTransactions]);

  // Filtered transactions for the expense statement view
  const filteredStatementTransactions = useMemo(() => {
    if (!allTransactions.length) return [];

    const activeTransactions = allTransactions.filter(
      (t) => !removedTransactionIds.has(t.transactionReference)
    );

    switch (statementFilter) {
      case "matched":
        return activeTransactions.filter((t) =>
          matchingTransactionIds.has(t.transactionReference)
        );
      case "unmatched":
        return activeTransactions.filter(
          (t) => !matchingTransactionIds.has(t.transactionReference)
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
    if (!fuelReport) return [];

    const allTransactions = fuelReport.fuelLogs;

    switch (transactionFilter) {
      case "matched":
        return allTransactions.filter((t) => {
          const fuelLogId = `${t.vehicleId}-${t.date}-${t.invoiceNumber}`;
          return matchingFuelLogIds.has(fuelLogId);
        });
      case "unmatched":
        return allTransactions.filter((t) => {
          const fuelLogId = `${t.vehicleId}-${t.date}-${t.invoiceNumber}`;
          return !matchingFuelLogIds.has(fuelLogId);
        });
      case "all":
      default:
        return allTransactions;
    }
  }, [fuelReport, matchingFuelLogIds, transactionFilter]);

  const fuelStatementColumns = useMemo(
    () =>
      createTransactionColumns(
        matchingTransactionIds,
        handleAddTransactionToFuelReport,
        handleRemoveTransaction
      ),
    [
      matchingTransactionIds,
      handleAddTransactionToFuelReport,
      handleRemoveTransaction,
    ]
  );

  const fuelLogColumns = useMemo(
    () =>
      createFuelLogColumns(
        matchingFuelLogIds,
        handleUpdateFuelLogField,
        true
      ),
    [matchingFuelLogIds, handleUpdateFuelLogField]
  );

  return (
    <main className="container mx-auto py-10 space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {fuelReport.name} Fuel Report Analysis
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
                      matchingTransactionIds.has(t.transactionReference) &&
                      !removedTransactionIds.has(t.transactionReference)
                  ).length
                }
                unmatchedCount={
                  allTransactions.filter(
                    (t) =>
                      !matchingTransactionIds.has(t.transactionReference) &&
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
              columns={fuelStatementColumns}
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
        {fuelReport ? (
          <div className="space-y-4">
            <FilterTabs
              activeFilter={transactionFilter}
              onFilterChange={setTransactionFilter}
              totalCount={fuelReport.fuelLogs.length}
              matchedCount={
                fuelReport.fuelLogs.filter((t) => {
                  const fuelLogId = `${t.vehicleId}-${t.date}-${t.invoiceNumber}`;
                  return matchingFuelLogIds.has(fuelLogId);
                }).length
              }
              unmatchedCount={
                fuelReport.fuelLogs.filter((t) => {
                  const fuelLogId = `${t.vehicleId}-${t.date}-${t.invoiceNumber}`;
                  return !matchingFuelLogIds.has(fuelLogId);
                }).length
              }
            />
            <DataTable
              columns={fuelLogColumns}
              data={filteredFuelLogs}
            />
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
