"use client";

import React from "react";
import { CSVUploadButton } from "./csv-upload-button";
import Papa from "papaparse";
import { FuelCSVRow } from "@/lib/validations/fuel";

interface FuelLogUploadButtonProps {
  onDataParsed: (data: FuelCSVRow[]) => void;
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

export function FuelLogUploadButton({
  onDataParsed,
  variant = "outline",
  size = "default",
  disabled = false,
}: FuelLogUploadButtonProps) {
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

        Papa.parse<FuelCSVRow>(csvText, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header: string): string => {
            return headerMap[header] || header;
          },
          transform: (value: string, field: string): string | number => {
            // Handle empty values
            if (!value || value.trim() === "") {
              // For numeric fields, return "0" string for Zod coercion
              switch (field) {
                case "vehicleId":
                  return "NO_VEHICLE_ID";
                case "driver":
                  return "NO_DRIVER";
                case "date":
                  return new Date().toString();
                case "invoiceNumber":
                  return "NO_INVOICE_NUMBER";
                case "sellerState":
                  return "NO_SELLER_STATE";
                case "sellerName":
                  return "NO_SELLER_NAME";
                case "receipt":
                  return "NO_RECEIPT";
                case "gallons":
                case "cost":
                case "odometer":
                  return "0";
              }
              return "";
            }

            if (
              field === "gallons" ||
              field === "cost" ||
              field === "odometer"
            ) {
              const cleanedValue = value.replace(/[$,\s()]/g, "");

              const numericValue = parseFloat(cleanedValue);
              return isNaN(numericValue) ? "0" : numericValue.toString();
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
              `Parsed ${results.data.length} fuel log records`
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
      label="Upload Fuel Log CSV"
      variant={variant}
      size={size}
      disabled={disabled}
    />
  );
}
