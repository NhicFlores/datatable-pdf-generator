"use client";

import React from "react";
import { CSVUploadButton } from "./csv-upload-button";
import Papa from "papaparse";
import { Expense_CSV_Row } from "@/lib/types";

interface TransactionsUploadButtonProps {
  onDataParsed: (data: Expense_CSV_Row[]) => void;
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

export function TransactionsUploadButton({
  onDataParsed,
  variant = "outline",
  size = "default",
  disabled = false,
}: TransactionsUploadButtonProps) {
  const handleFileSelect = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const csvText = e.target?.result as string;

        // Header mapping for expense CSV
        const headerMap: { [key: string]: string } = {
          "Statement Period - Start Date": "statementPeriodStartDate",
          "Statement Period - End Date": "statementPeriodEndDate",
          "Employee - ID": "employeeId",
          "Employee - First Name": "employeeFirstName",
          "Employee - Last Name": "employeeLastName",
          "Cardholder Name": "cardHolderName",
          "Account - Last Four Digits": "lastFourDigits",
          "Transaction - Transaction Reference": "transactionReference",
          "Transaction - Transaction Date": "transactionDate",
          "Transaction - Posting Date": "postingDate",
          "Transaction - Billing Amount": "billingAmount",
          "Transaction - Line Amount": "lineAmount",
          "Transaction - Line Number": "lineNumber",
          "Transaction Line Coding - GL Code": "glCode",
          "Transaction Line Coding Description - GL Code": "glCodeDescription",
          "Transaction - Reason for Expense": "reasonForExpense",
          "Transaction - Receipt Image Name": "receiptImageName",
          "Transaction - Receipt Image Reference ID": "receiptImageReferenceId",
          "Supplier - Name": "supplierName",
          "Supplier - City": "supplierCity",
          "Supplier - State": "supplierState",
          "Transaction - Workflow Status": "workflowStatus",
          "Supplier - Merchant Category Code": "merchantCategoryCode",
          "Fuel - Odometer Reading": "odometerReading",
          "Fuel - Fuel Quantity": "fuelQuantity",
          "Fuel - Fuel Type": "fuelType",
          "Fuel - Fuel Unit Cost": "fuelUnitCost",
          "Fuel - Fuel Unit of Measure": "fuelUnitOfMeasure",
        };

        Papa.parse<Expense_CSV_Row>(csvText, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header: string): string => {
            return headerMap[header] || header;
          },
          transform: (
            value: string,
            field: string
          ): string | number | undefined => {
            // Handle empty values for optional numeric fields
            if (!value || value.trim() === "") {
              return undefined;
            }

            // Parse numeric fields
            if (
              field === "fuelQuantity" ||
              field === "fuelUnitCost" ||
              field === "odometerReading"
            ) {
              const parsed = parseFloat(value);
              return isNaN(parsed) ? undefined : parsed;
            }

            return value;
          },
          complete: (results) => {
            if (results.errors && results.errors.length > 0) {
              console.error("CSV parsing errors:", results.errors);
              reject(new Error("Failed to parse CSV file"));
              return;
            }

            console.log(`Parsed ${results.data.length} transaction records`);
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
      label="Upload Transactions CSV"
      variant={variant}
      size={size}
      disabled={disabled}
    />
  );
}
