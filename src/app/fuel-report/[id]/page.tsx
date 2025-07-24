"use client";
import {
  useFuelReports,
  useFuelStatements,
  useFuelReportActions,
} from "@/components/data-context";
import { DataTable } from "@/components/tables/data-table";
import { createFuelStatementColumns } from "@/components/tables/fuel-statement-columns";
import { createFuelTransactionColumns } from "@/components/tables/fuel-transaction-columns";
import { CSVDownloadButton } from "@/components/csv-download-button";
import { FilterTabs } from "@/components/filter-tabs";

import {
  getMatchingFuelTransactions,
  getMatchingTransactions,
  getMissingFuelTransactions,
} from "@/lib/data";
import React, { useMemo, useState, useCallback } from "react";

const FuelReportPage = () => {
  const { selectedFuelReport } = useFuelReports();
  const { selectedFuelStatement } = useFuelStatements();
  const { addTransactionToFuelReport, updateFuelTransactionField } =
    useFuelReportActions();

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

  // Get discrepancies for quick access
  const fuelTransactionDiscrepancies = useMemo(() => {
    return getMissingFuelTransactions(
      selectedFuelReport?.fuelTransactions || [],
      selectedFuelStatement?.transactions || []
    );
  }, [selectedFuelReport, selectedFuelStatement]);

  // Get matching transaction IDs for highlighting
  const matchingFuelTransactionIds = useMemo(() => {
    if (!selectedFuelReport || !selectedFuelStatement) return new Set<string>();
    return getMatchingFuelTransactions(
      selectedFuelReport.fuelTransactions,
      selectedFuelStatement.transactions
    );
  }, [selectedFuelReport, selectedFuelStatement]);

  const matchingTransactionIds = useMemo(() => {
    if (!selectedFuelReport || !selectedFuelStatement) return new Set<string>();
    return getMatchingTransactions(
      selectedFuelReport.fuelTransactions,
      selectedFuelStatement.transactions
    );
  }, [selectedFuelReport, selectedFuelStatement]);

  // Filtered data for statement transactions
  const filteredStatementTransactions = useMemo(() => {
    if (!selectedFuelStatement) return [];

    const allTransactions = selectedFuelStatement.transactions.filter(
      (t) => !removedTransactionIds.has(t.transactionReference)
    );

    switch (statementFilter) {
      case "matched":
        return allTransactions.filter((t) =>
          matchingTransactionIds.has(t.transactionReference)
        );
      case "unmatched":
        return allTransactions.filter(
          (t) => !matchingTransactionIds.has(t.transactionReference)
        );
      case "all":
      default:
        return allTransactions;
    }
  }, [
    selectedFuelStatement,
    matchingTransactionIds,
    statementFilter,
    removedTransactionIds,
  ]);

  // Filtered data for fuel transactions
  const filteredFuelTransactions = useMemo(() => {
    if (!selectedFuelReport) return [];

    const allTransactions = selectedFuelReport.fuelTransactions;

    switch (transactionFilter) {
      case "matched":
        return allTransactions.filter((t) => {
          const fuelTransactionId = `${t.vehicleId}-${t.date}-${t.invoiceNumber}`;
          return matchingFuelTransactionIds.has(fuelTransactionId);
        });
      case "unmatched":
        return allTransactions.filter((t) => {
          const fuelTransactionId = `${t.vehicleId}-${t.date}-${t.invoiceNumber}`;
          return !matchingFuelTransactionIds.has(fuelTransactionId);
        });
      case "all":
      default:
        return allTransactions;
    }
  }, [selectedFuelReport, matchingFuelTransactionIds, transactionFilter]);

  const fuelStatementColumns = useMemo(
    () =>
      createFuelStatementColumns(
        matchingTransactionIds,
        addTransactionToFuelReport,
        handleRemoveTransaction
      ),
    [
      matchingTransactionIds,
      addTransactionToFuelReport,
      handleRemoveTransaction,
    ]
  );

  const fuelTransactionColumns = useMemo(
    () =>
      createFuelTransactionColumns(
        matchingFuelTransactionIds,
        updateFuelTransactionField,
        true
      ),
    [matchingFuelTransactionIds, updateFuelTransactionField]
  );

  return (
    <main className="container mx-auto py-10 space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Fuel Report Analysis
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

      {/* Quick Discrepancies Overview */}
      {fuelTransactionDiscrepancies.length > 0 && (
        <section className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-amber-800">
                Missing Fuel Transactions Found
              </h3>
              <p className="text-amber-700">
                {fuelTransactionDiscrepancies.length} transactions found in
                expense statement but missing from fuel report
              </p>
            </div>
            {selectedFuelStatement && (
              <CSVDownloadButton
                data={fuelTransactionDiscrepancies}
                filename={`missing_fuel_transactions_${selectedFuelStatement.cardHolderName.replace(
                  /[^a-zA-Z0-9]/g,
                  "_"
                )}_${new Date().toISOString().split("T")[0]}.csv`}
                label="Export Missing"
              />
            )}
          </div>
        </section>
      )}

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Fuel Transactions (Expense Statement)
          </h2>
          {selectedFuelStatement &&
            selectedFuelStatement.transactions.length > 0 && (
              <CSVDownloadButton
                data={filteredStatementTransactions}
                filename={`fuel_statement_transactions_${selectedFuelStatement.cardHolderName.replace(
                  /[^a-zA-Z0-9]/g,
                  "_"
                )}_${new Date().toISOString().split("T")[0]}.csv`}
                label="Export Statement Transactions"
              />
            )}
        </div>

        {selectedFuelStatement ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FilterTabs
                activeFilter={statementFilter}
                onFilterChange={setStatementFilter}
                totalCount={
                  selectedFuelStatement.transactions.filter(
                    (t) => !removedTransactionIds.has(t.transactionReference)
                  ).length
                }
                matchedCount={
                  selectedFuelStatement.transactions.filter(
                    (t) =>
                      matchingTransactionIds.has(t.transactionReference) &&
                      !removedTransactionIds.has(t.transactionReference)
                  ).length
                }
                unmatchedCount={
                  selectedFuelStatement.transactions.filter(
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
            No statement selected
          </div>
        )}
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            All Fuel Transactions (Fuel Report)
          </h2>
          {selectedFuelReport &&
            selectedFuelReport.fuelTransactions.length > 0 && (
              <CSVDownloadButton
                data={filteredFuelTransactions}
                driverName={selectedFuelReport.driver}
                filename={`fuel_transactions_${selectedFuelReport.driver.replace(
                  /[^a-zA-Z0-9]/g,
                  "_"
                )}_${new Date().toISOString().split("T")[0]}.csv`}
                label="Export Fuel Transactions"
              />
            )}
        </div>
        {selectedFuelReport ? (
          <div className="space-y-4">
            <FilterTabs
              activeFilter={transactionFilter}
              onFilterChange={setTransactionFilter}
              totalCount={selectedFuelReport.fuelTransactions.length}
              matchedCount={
                selectedFuelReport.fuelTransactions.filter((t) => {
                  const fuelTransactionId = `${t.vehicleId}-${t.date}-${t.invoiceNumber}`;
                  return matchingFuelTransactionIds.has(fuelTransactionId);
                }).length
              }
              unmatchedCount={
                selectedFuelReport.fuelTransactions.filter((t) => {
                  const fuelTransactionId = `${t.vehicleId}-${t.date}-${t.invoiceNumber}`;
                  return !matchingFuelTransactionIds.has(fuelTransactionId);
                }).length
              }
            />
            <DataTable
              columns={fuelTransactionColumns}
              data={filteredFuelTransactions}
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
};

export default FuelReportPage;
