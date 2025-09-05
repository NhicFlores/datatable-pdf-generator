"use client";

import { DataTable } from "@/components/tables/data-table";
import { FuelReportSummaryColumns } from "@/components/tables/fuel-report-summary-columns";
import { TransactionsUploadButton } from "@/components/csv/transactions-upload-button";
import { FuelLogUploadButton } from "@/components/csv/fuel-log-upload-button";
import { FuelCSVRow } from "@/lib/validations/fuel";
import React from "react";
import Link from "next/link";
import { FuelReportSummaryRoute } from "@/lib/routes";
import { ExpenseCSVRow } from "@/lib/validations/transaction";
import { FuelReportSummary } from "@/lib/data-model/query-types";

interface FuelReportsListProps {
  fuelReportSummaries: FuelReportSummary[];
}

export function FuelReportsList({ fuelReportSummaries }: FuelReportsListProps) {
  // receive parsed csv data, send to API endpoint, handle server response, provide user feedback
  const handleTransactionsData = async (data: ExpenseCSVRow[]) => {
    console.log("🔄 Processing transactions:", data.length, "records");
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transactions: data }),
      });

      const result = await response.json();

      if (result.success || response.status === 207) {
        // Show detailed success message with error breakdown
        const errorSummary =
          result.data.totalErrors > 0
            ? `\n⚠️ ${
                result.data.totalErrors
              } issues found:\n${result.data.validationErrors
                .slice(0, 3)
                .join("\n")}${
                result.data.validationErrors.length > 3 ? "\n..." : ""
              }`
            : "";

        alert(`✅ Processing Complete!
        • ${result.data.transactionsCreated} transactions saved
        • ${result.data.driversCreated} drivers created/found
        • ${result.data.duplicatesSkipped} duplicates skipped  
        • ${result.data.nonDriversSkipped} non-driver transactions skipped${errorSummary}`);

        console.log("✅ Processing complete:", result);
      } else {
        throw new Error(result.error || "Failed to process data");
      }
    } catch (error) {
      console.error("💥 Error processing transaction data:", error);
      alert(
        `❌ Failed to process transaction data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleFuelData = async (data: FuelCSVRow[]) => {
    console.log("🔄 Processing fuel data:", data.length, "records");

    try {
      const response = await fetch("/api/fuel-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transactions: data }),
      });

      const result = await response.json();

      if (result.success) {
        const validationErrorSummary =
          result.details.validationErrors?.length > 0
            ? `\n⚠️ ${result.details.validationErrors.length} validation issues found`
            : "";

        const databaseErrorSummary =
          result.details.databaseErrors?.length > 0
            ? `\n❌ ${result.details.databaseErrors.length} database errors occurred`
            : "";

        alert(`✅ Processing Complete! 
        • ${result.details.driversCreated} drivers created/found
        • ${result.details.transactionsCreated} fuel transactions saved
        • ${
          result.details.insertedIds?.length || 0
        } records inserted${validationErrorSummary}${databaseErrorSummary}`);

        console.log("✅ Fuel processing complete:", result);

        // The page will automatically revalidate due to server-side revalidatePath
        // No need for manual reload
      } else {
        throw new Error(result.error || "Failed to process data");
      }
    } catch (error) {
      console.error("💥 Error processing fuel data:", error);
      alert(
        `❌ Failed to process fuel data: ${
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
        {/* TODO: Re-enable export button with new summary data */}
        {/* <AllFuelTransactionsExportButton
          filename="updated-fuel-report.csv"
          label="Download Updated Report"
          size="sm"
          variant="outline"
        /> */}
      </div>

      {/* Upload Section */}
      <div className="bg-gray-50 p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Upload CSV Files</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Fuel Log Data</h3>
            <p className="text-sm text-gray-600 mb-3">
              Upload fuel log CSV files to import fuel usage data and
              create/update driver records.
            </p>
            <FuelLogUploadButton onDataParsed={handleFuelData} size="default" />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Transaction Data</h3>
            <p className="text-sm text-gray-600 mb-3">
              Upload expense transaction CSV files. Drivers will be created
              automatically from cardholder names.
            </p>
            <TransactionsUploadButton
              onDataParsed={handleTransactionsData}
              size="default"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div>
        <DataTable
          columns={FuelReportSummaryColumns}
          data={fuelReportSummaries}
        />
      </div>
    </main>
  );
}
