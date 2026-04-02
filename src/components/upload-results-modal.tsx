"use client";

import { X, Download, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface UploadResult {
  type: "fuel" | "transactions";
  success: boolean;
  summary: {
    created?: number;
    driversCreated?: number;
    duplicatesSkipped?: number;
    nonDriversSkipped?: number;
    totalErrors?: number;
  };
  details: {
    validationErrors?: string[];
    databaseErrors?: string[];
    insertedIds?: string[];
  };
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
      summary: result.summary,
      details: result.details,
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

  const hasErrors =
    (result.details.validationErrors?.length || 0) > 0 ||
    (result.details.databaseErrors?.length || 0) > 0;

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
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {result.type === "fuel"
                    ? "Fuel Logs Saved:"
                    : "Transactions Saved:"}
                </span>
                <span className="font-medium text-green-600">
                  {result.summary.created}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Drivers Created:</span>
                <span className="font-medium text-primary">
                  {result.summary.driversCreated}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Duplicates Skipped:
                </span>
                <span className="font-medium text-yellow-600">
                  {result.summary.duplicatesSkipped}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Non-Drivers Skipped:
                </span>
                <span className="font-medium text-muted-foreground">
                  {result.summary.nonDriversSkipped}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Errors:</span>
                <span className="font-medium text-destructive">
                  {result.summary.totalErrors}
                </span>
              </div>
            </div>
          </div>

          {/* Validation Errors */}
          {result.details.validationErrors &&
            result.details.validationErrors.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-medium mb-2 text-destructive">
                  Validation Errors ({result.details.validationErrors.length})
                </h4>
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 max-h-32 overflow-y-auto">
                  <ul className="text-sm space-y-1">
                    {result.details.validationErrors.map((error, index) => (
                      <li key={index} className="text-destructive">
                        • {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

          {/* Database Errors */}
          {result.details.databaseErrors &&
            result.details.databaseErrors.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-medium mb-2 text-destructive">
                  Database Errors ({result.details.databaseErrors.length})
                </h4>
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 max-h-32 overflow-y-auto">
                  <ul className="text-sm space-y-1">
                    {result.details.databaseErrors.map((error, index) => (
                      <li key={index} className="text-destructive">
                        • {error}
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
