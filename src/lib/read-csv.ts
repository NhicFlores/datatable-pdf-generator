import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { CSV_Row } from "./types";

export async function getCsvData(): Promise<CSV_Row[]> {
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
      "Account - Last Four Digits": "lastFourDigits",
      "Cardholder Name": "cardHolderName",
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
    };

    const result: ParseResult<CSV_Row> = Papa.parse<CSV_Row>(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string): string => {
        return headerMap[header] || header;
      },
    });

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
