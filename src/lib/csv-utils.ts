import {
  FuelTransaction,
  Transaction,
  FuelSummaryData,
  FuelReport,
} from "./types";

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
// Function to download all fuel transactions in original fuel-report.csv format
export function downloadAllFuelTransactionsCSV(
  fuelReports: FuelReport[],
  filename?: string
) {
  // Headers matching the original fuel-report.csv format
  const headers = [
    "vehicle",
    "driver",
    "startTime",
    "invoiceNumber",
    "gallons",
    "Cost",
    "sellerStateFullName",
    "sellerName",
    "odometer",
    "receipt",
  ];

  // Flatten all fuel transactions from all reports
  const allTransactions = fuelReports.flatMap((report) =>
    report.fuelTransactions.map((tx: FuelTransaction) => ({
      vehicle: tx.vehicleId,
      driver: report.driver,
      startTime: tx.date,
      invoiceNumber: tx.invoiceNumber,
      gallons: tx.gallons,
      Cost: tx.cost,
      sellerStateFullName: tx.sellerState,
      sellerName: tx.sellerName,
      odometer: tx.odometer,
      receipt: tx.receipt,
    }))
  );

  const defaultFilename = filename || "updated-fuel-report.csv";
  downloadCSV(allTransactions, defaultFilename, headers);
}

export function downloadFuelSummaryCSV(
  summaryData: FuelSummaryData,
  filename?: string
) {
  const { summaryRows, uniqueTruckIds } = summaryData;

  // List of all 50 US states in alphabetical order
  const allStates = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
  ];

  // Create headers: State, Total Gallons, then each truck ID
  const headers = ["state", "totalGallons", ...uniqueTruckIds];

  // Create a map of existing summary data for quick lookup
  const summaryMap = new Map(summaryRows.map((row) => [row.state, row]));

  // Format data for CSV export - include all states
  const formattedData = allStates.map((state) => {
    const existingRow = summaryMap.get(state);

    const baseData = {
      state: state,
      totalGallons: existingRow ? existingRow.totalGallons.toFixed(2) : "0.00",
    };

    // Add gallons for each truck
    const truckData = uniqueTruckIds.reduce((acc, truckId) => {
      acc[truckId] =
        existingRow && existingRow.truckGallons[truckId]
          ? existingRow.truckGallons[truckId].toFixed(2)
          : "0.00";
      return acc;
    }, {} as Record<string, string>);

    return { ...baseData, ...truckData };
  });

  // Add totals row
  const totalGallons = summaryRows.reduce(
    (sum, row) => sum + row.totalGallons,
    0
  );
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
