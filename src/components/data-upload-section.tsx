"use client";

import { useState } from "react";
import { toast } from "sonner";
import { TransactionsUploadButton } from "@/components/csv/transactions-upload-button";
import { FuelLogUploadButton } from "@/components/csv/fuel-log-upload-button";
import { UploadResultsModal, UploadResult } from "@/components/upload-results-modal";
import { FuelCSVRow } from "@/lib/validations/fuel";
import { ExpenseCSVRow } from "@/lib/validations/transaction";
import type { FuelUploadResponse } from "@/lib/data-model/upload-types";

export function DataUploadSection() {
  const [modalResult, setModalResult] = useState<UploadResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showResults = (result: UploadResult) => {
    setModalResult(result);
    setIsModalOpen(true);
  };

  // receive parsed csv data, send to API endpoint, handle server response, provide user feedback
  const handleTransactionsData = async (data: ExpenseCSVRow[]) => {
    console.log("🔄 Processing transactions:", data.length, "records");
    
    const loadingToastId = toast.loading(`Processing ${data.length} transaction records...`);
    
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
        // Dismiss loading toast
        toast.dismiss(loadingToastId);
        
        const hasErrors = result.data.totalErrors > 0;
        const resultData = {
          type: "transactions" as const,
          success: true,
          summary: {
            created: result.data.transactionsCreated,
            driversCreated: result.data.driversCreated,
            duplicatesSkipped: result.data.duplicatesSkipped,
            nonDriversSkipped: result.data.nonDriversSkipped,
            totalErrors: result.data.totalErrors,
          },
          // The transactions API still returns plain string arrays; adapt them
          // to the structured error shape the modal expects.
          errors: [
            ...(result.data.validationErrors || []).map((message: string) => ({
              stage: "validation" as const,
              message,
            })),
            ...(result.data.databaseErrors || []).map((message: string) => ({
              stage: "insert" as const,
              message,
            })),
          ],
        };

        if (hasErrors) {
          // Show error toast and auto-open modal
          toast.error(`Processed ${result.data.transactionsCreated} transactions with ${result.data.totalErrors} issues`);
          setTimeout(() => showResults(resultData), 500);
        } else {
          // Show success toast with View Details action
          toast.success(
            `Successfully processed ${result.data.transactionsCreated} transactions`,
            {
              action: {
                label: "View Details",
                onClick: () => showResults(resultData),
              },
            }
          );
        }

        console.log("✅ Processing complete:", result);
      } else {
        throw new Error(result.error || "Failed to process data");
      }
    } catch (error) {
      console.error("💥 Error processing transaction data:", error);
      toast.dismiss(loadingToastId);
      toast.error(`Failed to process transaction data: ${
        error instanceof Error ? error.message : "Unknown error"
      }`);
    }
  };

  const handleFuelData = async (data: FuelCSVRow[]) => {
    console.log("🔄 Processing fuel data:", data.length, "records");

    const loadingToastId = toast.loading(`Processing ${data.length} fuel log records...`);

    try {
      const response = await fetch("/api/fuel-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transactions: data }),
      });

      const result: FuelUploadResponse = await response.json();
      toast.dismiss(loadingToastId);

      // No summary means the request itself was rejected (e.g. malformed body)
      if (!result.summary) {
        throw new Error(result.error || "Failed to process data");
      }

      const resultData: UploadResult = {
        type: "fuel",
        success: result.success,
        requestId: result.requestId,
        summary: {
          created: result.summary.created,
          driversCreated: result.summary.driversCreated,
          duplicatesSkipped: result.summary.duplicatesSkipped,
          failedRows: result.summary.failedRows,
          totalErrors: result.summary.totalErrors,
        },
        errors: result.errors,
        insertedIds: result.insertedIds,
      };

      if (!result.success) {
        // Nothing was saved (rejected or rolled back): show why
        toast.error(result.error || "Failed to process fuel data");
        setTimeout(() => showResults(resultData), 500);
      } else if (result.errors.length > 0) {
        toast.error(
          `Processed ${result.summary.created} fuel logs with ${result.errors.length} issues`
        );
        setTimeout(() => showResults(resultData), 500);
      } else {
        toast.success(
          `Successfully processed ${result.summary.created} fuel logs`,
          {
            action: {
              label: "View Details",
              onClick: () => showResults(resultData),
            },
          }
        );
      }

      console.log("✅ Fuel processing complete:", result);
    } catch (error) {
      console.error("💥 Error processing fuel data:", error);
      toast.dismiss(loadingToastId);
      toast.error(`Failed to process fuel data: ${
        error instanceof Error ? error.message : "Unknown error"
      }`);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Data Upload</h2>
        <p className="text-sm text-gray-600 mb-6">
          Upload CSV files to import fuel logs and transaction data into the
          system.
        </p>

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

      <UploadResultsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        result={modalResult}
      />
    </>
  );
}
