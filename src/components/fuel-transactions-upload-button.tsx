"use client";

import React from "react";
import { CSVUploadButton } from "./csv-upload-button";
import Papa from "papaparse";
import { Fuel_CSV_Row } from "@/lib/types";

interface FuelTransactionsUploadButtonProps {
  onDataParsed: (data: Fuel_CSV_Row[]) => void;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
}

export function FuelTransactionsUploadButton({
  onDataParsed,
  variant = "outline",
  size = "default",
  disabled = false,
}: FuelTransactionsUploadButtonProps) {
  const handleFileSelect = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const csvText = e.target?.result as string;

        // Header mapping for fuel CSV
        const headerMap: { [key: string]: string } = {
          vehicle: "vehicleId",
          driver: "driver",
          startTime: "date",
          invoiceNumber: "invoiceNumber",
          gallons: "gallons",
          Cost: "cost",
          sellerStateFullName: "sellerState",
          sellerName: "sellerName",
          odometer: "odometer",
          receipt: "receipt",
        };

        Papa.parse<Fuel_CSV_Row>(csvText, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header: string): string => {
            return headerMap[header] || header;
          },
          transform: (value: string, field: string): string | number => {
            // Handle empty values
            if (!value || value.trim() === "") {
              return field === "gallons" ||
                field === "cost" ||
                field === "odometer"
                ? 0
                : "";
            }

            // Parse numeric fields
            if (field === "gallons" || field === "cost") {
              const parsed = parseFloat(value);
              return isNaN(parsed) ? 0 : parsed;
            }

            if (field === "odometer") {
              const parsed = parseInt(value, 10);
              return isNaN(parsed) ? 0 : parsed;
            }

            return value;
          },
          complete: (results) => {
            if (results.errors && results.errors.length > 0) {
              console.error("CSV parsing errors:", results.errors);
              reject(new Error("Failed to parse CSV file"));
              return;
            }

            console.log(
              `Parsed ${results.data.length} fuel transaction records`
            );
            onDataParsed(results.data);
            resolve();
          },
          error: (error: Error) => {
            console.error("Papa Parse error:", error);
            reject(new Error("Failed to parse CSV file"));
          },
        });
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsText(file);
    });
  };

  return (
    <CSVUploadButton
      onFileSelect={handleFileSelect}
      label="Upload Fuel Logs CSV"
      variant={variant}
      size={size}
      disabled={disabled}
    />
  );
}
