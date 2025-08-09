"use client";
import { useFuelReports } from "@/components/data-context";
import { DataTable } from "@/components/tables/data-table";
import { FuelReportColumns } from "@/components/tables/fuel-driver-columns";
import { AllFuelTransactionsExportButton } from "@/components/all-fuel-transactions-export-button";
import { TransactionsUploadButton } from "@/components/transactions-upload-button";
import { FuelTransactionsUploadButton } from "@/components/fuel-transactions-upload-button";
import { Expense_CSV_Row, Fuel_CSV_Row } from "@/lib/types";
import React from "react";
import Link from "next/link";
import { FuelReportSummaryRoute } from "@/lib/routes";

const FuelReportsPage = () => {
  const { fuelReports } = useFuelReports();

  const handleTransactionsData = async (data: Expense_CSV_Row[]) => {
    console.log("Transactions data received:", data.length, "records");

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transactions: data }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✅ Success! 
        • ${result.details.transactionsCreated} transactions saved
        • ${result.details.duplicatesSkipped} duplicates skipped
        • ${result.details.nonDriversSkipped} non-driver transactions skipped
        ${
          result.details.errors.length > 0
            ? `\n⚠️ ${result.details.errors.length} errors occurred`
            : ""
        }`);

        // TODO: Refresh the transactions data to show new records
        console.log("Processing complete:", result);
      } else {
        throw new Error(result.error || "Failed to save data");
      }
    } catch (error) {
      console.error("Error saving transaction data:", error);
      alert(
        `❌ Failed to save transaction data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleFuelData = async (data: Fuel_CSV_Row[]) => {
    console.log("Fuel data received:", data.length, "records");

    try {
      const response = await fetch("/api/fuel-transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transactions: data }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✅ Success! 
        • ${result.details.driversCreated} drivers created/found
        • ${result.details.transactionsCreated} fuel transactions saved
        ${
          result.details.errors.length > 0
            ? `\n⚠️ ${result.details.errors.length} errors occurred`
            : ""
        }`);

        // TODO: Refresh the fuel reports data to show new records
        console.log("Processing complete:", result);
      } else {
        throw new Error(result.error || "Failed to save data");
      }
    } catch (error) {
      console.error("Error saving fuel data:", error);
      alert(
        `❌ Failed to save fuel data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  return (
    <main className="container mx-auto py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Fuel Reports</h1>
          <Link
            href={FuelReportSummaryRoute.page}
            className="border p-2 rounded hover:bg-gray-100"
          >
            View Summary
          </Link>
        </div>
        <AllFuelTransactionsExportButton
          filename="updated-fuel-report.csv"
          label="Download Updated Report"
          size="sm"
          variant="outline"
        />
      </div>

      {/* Upload Section */}
      <div className="bg-gray-50 p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Upload CSV Files</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Transaction Data</h3>
            <p className="text-sm text-gray-600 mb-3">
              Upload expense transaction CSV files to import transaction data
              into the system.
            </p>
            <TransactionsUploadButton
              onDataParsed={handleTransactionsData}
              size="default"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Fuel Transaction Data</h3>
            <p className="text-sm text-gray-600 mb-3">
              Upload fuel transaction CSV files to import fuel usage data into
              the system.
            </p>
            <FuelTransactionsUploadButton
              onDataParsed={handleFuelData}
              size="default"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div>
        <DataTable columns={FuelReportColumns} data={fuelReports} />
      </div>
    </main>
  );
};

export default FuelReportsPage;
