// DEPRECATED OR REFACTOR
import React from "react";
import { Button } from "../ui/button";
import { Download } from "lucide-react";
import {
  Transaction,
  FuelTransaction,
} from "@/lib/data-model/DEPRECATED-TYPES";
import {
  downloadFuelTransactionsCSV,
  downloadExpenseTransactionsCSV,
} from "@/lib/csv-utils";

interface CSVDownloadButtonProps {
  data: FuelTransaction[] | Transaction[];
  filename?: string;
  label?: string;
  driverName?: string; // Add driver name prop
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export function CSVDownloadButton({
  data,
  filename,
  label,
  driverName,
  variant = "outline",
  size = "sm",
}: CSVDownloadButtonProps) {
  const handleDownload = () => {
    if (!data || data.length === 0) {
      alert("No data to export");
      return;
    }

    // Check if it's fuel transactions or expense transactions
    if ("vehicleId" in data[0]) {
      // It's fuel transactions
      downloadFuelTransactionsCSV(
        data as FuelTransaction[],
        driverName,
        filename
      );
    } else {
      // It's expense transactions
      downloadExpenseTransactionsCSV(data as Transaction[], filename);
    }
  };

  const defaultLabel = label || `Export CSV (${data?.length || 0})`;

  return (
    <Button
      onClick={handleDownload}
      disabled={!data || data.length === 0}
      variant={variant}
      size={size}
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      {defaultLabel}
    </Button>
  );
}
