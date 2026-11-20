"use client";

import { X, Download, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatUploadError,
  type UploadRowError,
} from "@/lib/data-model/upload-types";

export interface UploadResult {
  type: "fuel" | "transactions";
  success: boolean;
  /** Correlates this result with server logs */
  requestId?: string;
  summary: {
    created?: number;
    driversCreated?: number;
    duplicatesSkipped?: number;
    nonDriversSkipped?: number;
    failedRows?: number;
    totalErrors?: number;
  };
  errors: UploadRowError[];
  insertedIds?: string[];
}

interface UploadResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: UploadResult | null;
}

export function UploadResultsModal({
  isOpen,
  onClose,
  result,
}: UploadResultsModalProps) {
  if (!isOpen || !result) return null;

  const downloadResults = () => {
    const data = {
      uploadType: result.type,
      timestamp: new Date().toISOString(),
      requestId: result.requestId,
      success: result.success,
      summary: result.summary,
      errors: result.errors,
      insertedIds: result.insertedIds,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `upload-results-${result.type}-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, "-")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const validationErrors = result.errors.filter((e) => e.stage === "validation");
  const databaseErrors = result.errors.filter((e) => e.stage !== "validation");
  const hasErrors = result.errors.length > 0;

  const summaryRows: { label: string; value?: number; className: string }[] = [
    {
      label:
        result.type === "fuel" ? "Fuel Logs Saved:" : "Transactions Saved:",
      value: result.summary.created,
      className: "text-green-600",
    },
    {
      label: "Drivers Created:",
      value: result.summary.driversCreated,
      className: "text-primary",
    },
    {
      label: "Duplicates Skipped:",
      value: result.summary.duplicatesSkipped,
      className: "text-yellow-600",
    },
    {
      label: "Non-Drivers Skipped:",
      value: result.summary.nonDriversSkipped,
      className: "text-muted-foreground",
    },
    {
      label: "Rows Failed:",
      value: result.summary.failedRows,
      className: "text-destructive",
    },
    {
      label: "Total Errors:",
      value: result.summary.totalErrors,
      className: "text-destructive",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl mx-4 sm:mx-6 md:mx-auto sm:rounded-lg bg-card text-card-foreground shadow-lg transition-all animate-in fade-in zoom-in max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
          <div className="flex items-center gap-3">
            {result.success ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <AlertCircle className="h-6 w-6 text-destructive" />
            )}
            <h2 className="text-xl font-semibold text-foreground">
              {result.type === "fuel" ? "Fuel Log" : "Transaction"} Upload
              Results
            </h2>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Summary */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {summaryRows
                .filter((row) => row.value !== undefined)
                .map((row) => (
                  <div key={row.label} className="flex justify-between">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className={`font-medium ${row.className}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
            </div>
            {result.requestId && (
              <p className="mt-3 text-xs text-muted-foreground">
                Reference ID:{" "}
                <span className="font-mono select-all">{result.requestId}</span>
              </p>
            )}
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium mb-2 text-destructive">
                Validation Errors ({validationErrors.length})
              </h4>
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 max-h-48 overflow-y-auto">
                <ul className="text-sm space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-destructive">
                      • {formatUploadError(error)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Database Errors */}
          {databaseErrors.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium mb-2 text-destructive">
                Database Errors ({databaseErrors.length})
              </h4>
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 max-h-48 overflow-y-auto">
                <ul className="text-sm space-y-1">
                  {databaseErrors.map((error, index) => (
                    <li key={index} className="text-destructive">
                      • {formatUploadError(error)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Success Message */}
          {result.success && !hasErrors && (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md p-4">
              <p className="text-green-800 dark:text-green-200 text-sm">
                ✅ Upload completed successfully with no errors!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-t border-border bg-muted/50">
          <Button
            variant="outline"
            onClick={downloadResults}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Results
          </Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
