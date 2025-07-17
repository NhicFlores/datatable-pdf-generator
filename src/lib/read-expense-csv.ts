import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { Expense_CSV_Row } from "./types";

// consider processing into statement and transaction objects on server
// interface result {
//   statements: Statement[];
//   transactions: Transaction[];
// }

export async function getExpenseCsvData(): Promise<Expense_CSV_Row[]> {
  try {
    const filePath = path.join(process.cwd(), "data/report.csv");
    const fileContent = fs.readFileSync(filePath, "utf8");

    interface HeaderMap {
      [key: string]: string;
    }

    interface ParseResult<T> {
      data: T[];
      errors: Papa.ParseError[];
      meta: Papa.ParseMeta;
    }

    const headerMap: HeaderMap = {
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

    const result: ParseResult<Expense_CSV_Row> = Papa.parse<Expense_CSV_Row>(
      fileContent,
      {
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
      }
    );

    if (result.errors && result.errors.length > 0) {
      console.error("Error parsing CSV:", result.errors);
      return [];
    }

    return result.data;
  } catch (error) {
    console.error("Error reading CSV:", error);
    return [];
  }
}
