"use client";

import React from "react";
import { CSVUploadButton } from "./csv-upload-button";
import Papa from "papaparse";
import { FuelCSVRow } from "@/lib/validations/fuel";
// import { format, startOfDay } from "date-fns";

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
// header from export:
// vehicle,driver,startTime,invoiceNumber,gallons,Cost,sellerStateFullName,sellerName,odometer,receipt
// Vehicle, Purchaser, Date/Time, Invoice Number, Gallons, Cost, St./Prov., Merchant's Name, Vehicle Odometer, Receipt
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
        const rawText = e.target?.result as string;

        // Skip preamble lines (e.g. the empty ,,/ , rows before the real header
        // in the new export format) so PapaParse sees the header on row 0.
        const lines = rawText.split("\n");
        const headerLineIndex = lines.findIndex(
          (line) => line.trim().length > 0 && !/^[,"\s]*$/.test(line.trim()),
        );
        const csvText =
          headerLineIndex > 0
            ? lines.slice(headerLineIndex).join("\n")
            : rawText;

        // Map both new-format display headers and legacy headers → schema field names
        const headerMap: { [key: string]: string } = {
          // New export format
          Vehicle: "vehicleId",
          "Linked Driver": "driver",
          "Date/Time": "date",
          "Invoice Number": "invoiceNumber",
          Volume: "gallons",
          Cost: "cost",
          "St./Prov.": "sellerState",
          "Merchant's Name": "sellerName",
          "Vehicle Odometer": "odometer",
          Receipt: "receipt",
          // Legacy format
          vehicle: "vehicleId",
          linkedDriver: "driver",
          driver: "driver",
          startTime: "date",
          gallons: "gallons",
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
                  // TODO: update to .toISOString() before next quarter release
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
            // TODO: enable before next quarter release
            // // Special handling for date field to ensure consistent timezone
            // if (field === "date") {
            //   try {
            //     // Parse the date string (browser assumes local timezone)
            //     const parsedDate = new Date(value);

            //     // Normalize to start of day in local timezone
            //     const normalizedDate = startOfDay(parsedDate);

            //     // Format as YYYY-MM-DD for consistent database storage
            //     const formattedDate = format(normalizedDate, "yyyy-MM-dd");

            //     console.log('🗓️ DATE TRANSFORM:', {
            //       original: value,
            //       parsed: parsedDate.toISOString(),
            //       normalized: normalizedDate.toISOString(),
            //       formatted: formattedDate
            //     });

            //     return formattedDate;
            //   } catch (error) {
            //     console.error('Date parsing error:', error);
            //     return format(startOfDay(new Date()), "yyyy-MM-dd");
            //   }
            // }

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

            console.log(`Parsed ${results.data.length} fuel log records`);
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
