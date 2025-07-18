import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { Fuel_CSV_Row } from "./types";

export async function getFuelCsvData(): Promise<Fuel_CSV_Row[]> {
  try {
    const filePath = path.join(process.cwd(), "data/fuel-report.csv");
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

    const result: ParseResult<Fuel_CSV_Row> = Papa.parse<Fuel_CSV_Row>(
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
          if (field === "gallons" || field === "cost" || field === "odometer") {
            const parsed = parseFloat(value);
            return isNaN(parsed) ? undefined : parsed;
          }

          return value;
        },
      }
    );

    if (result.errors && result.errors.length > 0) {
      console.error("Errors while parsing CSV:", result.errors);
      return [];
    }

    return result.data;
  } catch (error) {
    console.error("Error reading fuel CSV file:", error);
    return [];
  }
}
