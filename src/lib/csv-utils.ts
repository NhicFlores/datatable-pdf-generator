import { FuelTransaction, Transaction, FuelSummaryData } from "./types";

// Generic CSV download function
export function downloadCSV(
  data: Record<string, unknown>[],
  filename: string,
  headers?: string[]
) {
  if (data.length === 0) {
    alert("No data to export");
    return;
  }

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    // Header row
    csvHeaders.join(","),
    // Data rows
    ...data.map((row) =>
      csvHeaders
        .map((header) => {
          const value = row[header];
          // Handle values that might contain commas or quotes
          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes('"'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || "";
        })
        .join(",")
    ),
  ].join("\n");

  // Create and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// Specific function for fuel transactions
export function downloadFuelTransactionsCSV(
  fuelTransactions: FuelTransaction[],
  driverName?: string,
  filename?: string
) {
  const headers = [
    "driver",
    "vehicleId",
    "date",
    "invoiceNumber",
    "gallons",
    "cost",
    "sellerState",
    "sellerName",
    "odometer",
    "receipt",
  ];

  const formattedData = fuelTransactions.map((tx) => ({
    driver: driverName || "Unknown",
    vehicleId: tx.vehicleId,
    date: tx.date,
    invoiceNumber: tx.invoiceNumber,
    gallons: tx.gallons,
    cost: tx.cost,
    sellerState: tx.sellerState,
    sellerName: tx.sellerName,
    odometer: tx.odometer,
    receipt: tx.receipt,
  }));

  const defaultFilename = `fuel_transactions_${
    new Date().toISOString().split("T")[0]
  }.csv`;
  downloadCSV(formattedData, filename || defaultFilename, headers);
}

// Specific function for expense transactions (missing fuel transactions)
export function downloadExpenseTransactionsCSV(
  transactions: Transaction[],
  filename?: string
) {
  const headers = [
    "transactionReference",
    "cardholderName",
    "lastFourDigits",
    "transactionDate",
    "postingDate",
    "billingAmount",
    "lineAmount",
    "lineNumber",
    "glCode",
    "glCodeDescription",
    "reasonForExpense",
    "receiptImageName",
    "receiptImageReferenceId",
    "supplierName",
    "supplierCity",
    "supplierState",
    "workflowStatus",
  ];

  const formattedData = transactions.map((tx) => ({
    transactionReference: tx.transactionReference,
    cardholderName: tx.cardholderName,
    lastFourDigits: tx.lastFourDigits,
    transactionDate: tx.transactionDate,
    postingDate: tx.postingDate,
    billingAmount: tx.billingAmount,
    lineAmount: tx.lineAmount,
    lineNumber: tx.lineNumber,
    glCode: tx.glCode,
    glCodeDescription: tx.glCodeDescription,
    reasonForExpense: tx.reasonForExpense,
    receiptImageName: tx.receiptImageName,
    receiptImageReferenceId: tx.receiptImageReferenceId,
    supplierName: tx.supplierName,
    supplierCity: tx.supplierCity,
    supplierState: tx.supplierState,
    workflowStatus: tx.workflowStatus,
  }));

  const defaultFilename = `missing_fuel_transactions_${
    new Date().toISOString().split("T")[0]
  }.csv`;
  downloadCSV(formattedData, filename || defaultFilename, headers);
}

// Function to export fuel summary data
export function downloadFuelSummaryCSV(
  summaryData: FuelSummaryData,
  filename?: string
) {
  const { summaryRows, uniqueTruckIds } = summaryData;

  // Create headers: State, Total Gallons, then each truck ID
  const headers = ["state", "totalGallons", ...uniqueTruckIds];

  // Format data for CSV export
  const formattedData = summaryRows.map((row) => {
    const baseData = {
      state: row.state,
      totalGallons: row.totalGallons.toFixed(2),
    };

    // Add gallons for each truck
    const truckData = uniqueTruckIds.reduce((acc, truckId) => {
      acc[truckId] = row.truckGallons[truckId]?.toFixed(2) || "0.00";
      return acc;
    }, {} as Record<string, string>);

    return { ...baseData, ...truckData };
  });

  // Add totals row
  const totalGallons = summaryRows.reduce((sum, row) => sum + row.totalGallons, 0);
  const truckTotals = uniqueTruckIds.reduce((totals, truckId) => {
    totals[truckId] = summaryRows
      .reduce((sum, row) => sum + (row.truckGallons[truckId] || 0), 0)
      .toFixed(2);
    return totals;
  }, {} as Record<string, string>);

  const totalsRow = {
    state: "TOTAL",
    totalGallons: totalGallons.toFixed(2),
    ...truckTotals,
  };

  formattedData.push(totalsRow);

  const defaultFilename = `fuel_summary_${
    new Date().toISOString().split("T")[0]
  }.csv`;
  downloadCSV(formattedData, filename || defaultFilename, headers);
}
