"use client";

import React from "react";
import { CSVUploadButton } from "./csv-upload-button";
import Papa from "papaparse";
import { ExpenseCSVRow } from "@/lib/validations/transaction";

interface TransactionsUploadButtonProps {
  onDataParsed: (data: ExpenseCSVRow[]) => void;
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
          "Employee - ID": "employeeId",
          "Employee - First Name": "employeeFirstName",
          "Employee - Last Name": "employeeLastName",
          "Employee - Company Unit": "employeeCompanyUnit",
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
          "Transaction - Workflow Status": "workflowStatus",
          "Supplier - Name": "supplierName",
          "Supplier - City": "supplierCity",
          "Supplier - State": "supplierState",
          "Supplier - Merchant Category Code": "merchantCategoryCode",
          "Fuel - Odometer Reading": "odometerReading",
          "Fuel - Fuel Quantity": "fuelQuantity",
          "Fuel - Fuel Type": "fuelType",
          "Fuel - Fuel Unit Cost": "fuelUnitCost",
          "Fuel - Fuel Unit of Measure": "fuelUnitOfMeasure",
        };

        Papa.parse<ExpenseCSVRow>(csvText, {
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
              switch (field) {
                case "employeeId":
                  return "NO_ID";
                case "employeeFirstName":
                  return "NO_FIRST_NAME";
                case "employeeLastName":
                  return "NO_LAST_NAME";
                case "employeeCompanyUnit":
                  return "NO_COMPANY_UNIT";
                case "cardHolderName":
                  return "NO_CARDHOLDER_NAME";
                case "lastFourDigits":
                  return "XXXX";
                case "transactionReference":
                  return "NO_TRANSACTION_REFERENCE";
                case "transactionDate":
                  return new Date().toDateString();
                case "postingDate":
                  return new Date().toDateString();
                case "billingAmount":
                  return "0";
                case "lineAmount":
                  return "0";
                case "lineNumber":
                  return "NO_LINE_NUMBER";
                case "glCode":
                  return "NO_GL_CODE";
                case "glCodeDescription":
                  return "NO_GL_CODE_DESCRIPTION";
                case "reasonForExpense":
                  return "NO_REASON_FOR_EXPENSE";
                case "receiptImageName":
                  return "NO_RECEIPT_IMAGE_NAME";
                case "receiptImageReferenceId":
                  return "NO_RECEIPT_IMAGE_REFERENCE_ID";
                case "workflowStatus":
                  return "NO_WORKFLOW_STATUS";
                case "supplierName":
                  return "NO_SUPPLIER_NAME";
                case "supplierCity":
                  return "NO_SUPPLIER_CITY";
                case "supplierState":
                  return "NO_SUPPLIER_STATE";
                case "merchantCategoryCode":
                  return "NO_MERCHANT_CATEGORY_CODE";
                case "odometerReading":
                  return "0";
                case "fuelQuantity":
                  return "0";
                case "fuelType":
                  return "NO_FUEL_TYPE";
                case "fuelUnitCost":
                  return "0";
                case "fuelUnitOfMeasure":
                  return "NO_UNIT";
              }
              return "NEW_FIELD";
            }

            // Parse numeric fields with improved validation
            const numericFields = [
              "billingAmount",
              "lineAmount",
              "fuelQuantity",
              "fuelUnitCost",
              "odometerReading",
            ];
            if (numericFields.includes(field)) {
              // Clean the value: remove currency symbols, commas, spaces, parentheses
              const cleanedValue = value.replace(/[$,\s()]/g, "");

              const parsed = parseFloat(cleanedValue);

              // Debug logging for problematic values
              if (
                (field === "billingAmount" || field === "lineAmount") &&
                isNaN(parsed)
              ) {
                console.log(
                  `🔍 Cleaning ${field}: "${value}" → "${cleanedValue}" → ${parsed}`
                );
              }

              if (isNaN(parsed)) {
                return "0";
              }

              return parsed.toString();
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
              `Parsed ${results.data.length} total transaction records`
            );

            // Filter for drivers only using employeeCompanyUnit
            const driverTransactions = results.data.filter((row) => {
              const companyUnit = row.employeeCompanyUnit
                ?.toString()
                .toLowerCase();
              return companyUnit === "drivers" || companyUnit === "driver";
            });

            const nonDriverCount =
              results.data.length - driverTransactions.length;

            console.log(`📊 Filtered results:`, {
              total: results.data.length,
              drivers: driverTransactions.length,
              nonDriversFiltered: nonDriverCount,
            });

            if (driverTransactions.length === 0) {
              reject(
                new Error(
                  "No driver transactions found in CSV. Please check that the 'Employee - Company Unit' column contains 'Drivers' for the records you want to import."
                )
              );
              return;
            }

            onDataParsed(driverTransactions);
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
