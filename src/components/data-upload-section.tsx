"use client";

import { useState } from "react";
import { toast } from "sonner";
import { TransactionsUploadButton } from "@/components/csv/transactions-upload-button";
import { FuelLogUploadButton } from "@/components/csv/fuel-log-upload-button";
import { UploadResultsModal, UploadResult } from "@/components/upload-results-modal";
import { FuelCSVRow } from "@/lib/validations/fuel";
import { ExpenseCSVRow } from "@/lib/validations/transaction";

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
          details: {
            validationErrors: result.data.validationErrors || [],
            databaseErrors: result.data.databaseErrors || [],
          },
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

      const result = await response.json();

      if (result.success) {
        // Dismiss loading toast
        toast.dismiss(loadingToastId);
        
        const hasErrors = (result.details.validationErrors?.length || 0) > 0 || 
                         (result.details.databaseErrors?.length || 0) > 0;

        const resultData = {
          type: "fuel" as const,
          success: true,
          summary: {
            created: result.details.transactionsCreated,
            driversCreated: result.details.driversCreated,
            duplicatesSkipped: result.details.skippedDuplicates,
          },
          details: {
            validationErrors: result.details.validationErrors || [],
            databaseErrors: result.details.databaseErrors || [],
            insertedIds: result.details.insertedIds || [],
          },
        };

        if (hasErrors) {
          // Show error toast and auto-open modal
          const errorCount = (result.details.validationErrors?.length || 0) + (result.details.databaseErrors?.length || 0);
          toast.error(`Processed ${result.details.transactionsCreated} fuel logs with ${errorCount} issues`);
          setTimeout(() => showResults(resultData), 500);
        } else {
          // Show success toast with View Details action
          toast.success(
            `Successfully processed ${result.details.transactionsCreated} fuel logs`,
            {
              action: {
                label: "View Details",
                onClick: () => showResults(resultData),
              },
            }
          );
        }

        console.log("✅ Fuel processing complete:", result);

        // The page will automatically revalidate due to server-side revalidatePath
        // No need for manual reload
      } else {
        throw new Error(result.error || "Failed to process data");
      }
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
