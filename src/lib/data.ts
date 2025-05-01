import fs from "fs"
import path from "path"
import Papa from "papaparse"
import type { Expense } from "./types"

export async function getExpenses(): Promise<Expense[]> {
  try {
    // Read the CSV file
    const filePath = path.join(process.cwd(), "data/expenses.csv")
    const fileContent = fs.readFileSync(filePath, "utf8")

    // Parse the CSV content
    const result = Papa.parse<Expense>(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Map CSV headers to our type properties
        const headerMap: Record<string, string> = {
          "Card Holder Name": "cardHolderName",
          "Statement Period Start Date": "statementPeriodStartDate",
          "Statement Period End Date": "statementPeriodEndDate",
          "Last Four Digits": "lastFourDigits",
          "Current Date": "currentDate",
          Supplier: "supplier",
          "Supplier Address": "supplierAddress",
          Amount: "amount",
        }

        return headerMap[header] || header
      },
    })

    if (result.errors && result.errors.length > 0) {
      console.error("Error parsing CSV:", result.errors)
      return []
    }

    return result.data
  } catch (error) {
    console.error("Error reading expenses:", error)
    return []
  }
}
