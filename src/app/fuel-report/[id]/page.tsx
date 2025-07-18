"use client";
import { useFuelReports, useFuelStatements } from "@/components/data-context";
import { DataTable } from "@/components/tables/data-table";
import { createFuelStatementColumns } from "@/components/tables/fuel-statement-columns-enhanced";
import { createFuelTransactionColumns } from "@/components/tables/fuel-transaction-columns-enhanced";
import { CSVDownloadButton } from "@/components/csv-download-button";

import {
  getMissingFuelTransactions,
  getMatchingFuelTransactions,
  getMatchingTransactions,
} from "@/lib/data";
import React, { useMemo } from "react";

const FuelReportPage = () => {
  const { selectedFuelReport } = useFuelReports();
  const { selectedFuelStatement } = useFuelStatements();

  const fuelTransactionDiscrepancies = getMissingFuelTransactions(
    selectedFuelReport?.fuelTransactions || [],
    selectedFuelStatement?.transactions || []
  );

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

  // Create enhanced columns with matching information
  const enhancedFuelStatementColumns = useMemo(
    () => createFuelStatementColumns(matchingTransactionIds),
    [matchingTransactionIds]
  );

  const enhancedFuelTransactionColumns = useMemo(
    () => createFuelTransactionColumns(matchingFuelTransactionIds),
    [matchingFuelTransactionIds]
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

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Missing Fuel Transactions (Expense Statement)
          </h2>
          {selectedFuelStatement && fuelTransactionDiscrepancies.length > 0 && (
            <CSVDownloadButton
              data={fuelTransactionDiscrepancies}
              filename={`missing_fuel_transactions_${selectedFuelStatement.cardHolderName.replace(
                /[^a-zA-Z0-9]/g,
                "_"
              )}_${new Date().toISOString().split("T")[0]}.csv`}
              label="Export Missing Transactions"
            />
          )}
        </div>
        {selectedFuelStatement ? (
          <div>
            <DataTable
              columns={enhancedFuelStatementColumns}
              data={fuelTransactionDiscrepancies}
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
                data={selectedFuelReport.fuelTransactions}
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
          <div>
            <DataTable
              columns={enhancedFuelTransactionColumns}
              data={selectedFuelReport.fuelTransactions}
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
