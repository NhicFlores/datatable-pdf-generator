import {
  Expense_CSV_Row,
  Fuel_CSV_Row,
  FuelReport,
  FuelExpenseDiscrepancy,
  FuelTransaction,
  Transaction,
  FuelStatement,
  FuelSummaryData,
  FuelSummaryRow,
} from "./types";
import { cleanName } from "./utils";

export function createFuelStatements(data: Expense_CSV_Row[]): FuelStatement[] {
  // Group transactions by cardHolderName
  const fuelStatements: FuelStatement[] = data.reduce(
    (acc: FuelStatement[], row: Expense_CSV_Row) => {
      const { cardHolderName } = row;

      const existingFuelStatement = acc.find(
        (fuelStatement) => fuelStatement.cardHolderName === cardHolderName
      );

      if (existingFuelStatement) {
        existingFuelStatement.transactions.push({
          transactionReference: row.transactionReference,
          cardholderName: row.cardHolderName,
          lastFourDigits: row.lastFourDigits,
          transactionDate: row.transactionDate,
          postingDate: row.postingDate,
          billingAmount: parseFloat(row.billingAmount),
          lineAmount: parseFloat(row.lineAmount),
          lineNumber: parseInt(row.lineNumber, 10),
          glCode: row.glCode,
          glCodeDescription: row.glCodeDescription,
          reasonForExpense: row.reasonForExpense,
          receiptImageName: row.receiptImageName,
          receiptImageReferenceId: row.receiptImageReferenceId,
          supplierName: row.supplierName,
          supplierCity: row.supplierCity,
          supplierState: row.supplierState,
          workflowStatus: row.workflowStatus,
          merchantCategoryCode: row.merchantCategoryCode,
          odometerReading: row.odometerReading,
          fuelQuantity: row.fuelQuantity,
          fuelType: row.fuelType,
          fuelUnitCost: row.fuelUnitCost,
          fuelUnitOfMeasure: row.fuelUnitOfMeasure,
        });
      } else {
        acc.push({
          cardHolderName,
          transactions: [
            {
              transactionReference: row.transactionReference,
              cardholderName: row.cardHolderName,
              lastFourDigits: row.lastFourDigits,
              transactionDate: row.transactionDate,
              postingDate: row.postingDate,
              billingAmount: parseFloat(row.billingAmount),
              lineAmount: parseFloat(row.lineAmount),
              lineNumber: parseInt(row.lineNumber, 10),
              glCode: row.glCode,
              glCodeDescription: row.glCodeDescription,
              reasonForExpense: row.reasonForExpense,
              receiptImageName: row.receiptImageName,
              receiptImageReferenceId: row.receiptImageReferenceId,
              supplierName: row.supplierName,
              supplierCity: row.supplierCity,
              supplierState: row.supplierState,
              workflowStatus: row.workflowStatus,
              merchantCategoryCode: row.merchantCategoryCode,
              odometerReading: row.odometerReading,
              fuelQuantity: row.fuelQuantity,
              fuelType: row.fuelType,
              fuelUnitCost: row.fuelUnitCost,
              fuelUnitOfMeasure: row.fuelUnitOfMeasure,
            },
          ],
        });
      }
      return acc;
    },
    []
  );

  return fuelStatements;
}

export function createFuelReports(data: Fuel_CSV_Row[]): FuelReport[] {
  // Group fuel transactions by driver name
  const fuelReports: FuelReport[] = data.reduce(
    (acc: FuelReport[], row: Fuel_CSV_Row) => {
      const { driver, vehicleId } = row;

      const existingReport = acc.find((report) => report.driver === driver);

      if (existingReport) {
        // Add the new fuel transaction
        existingReport.fuelTransactions.push({
          vehicleId: row.vehicleId,
          date: row.date,
          invoiceNumber: row.invoiceNumber,
          gallons: row.gallons || 0,
          cost: row.cost || 0,
          sellerState: row.sellerState,
          sellerName: row.sellerName,
          odometer: row.odometer || 0,
          receipt: row.receipt,
        });

        // Update vehicleBranches array with unique branch prefixes
        if (vehicleId) {
          const branch = vehicleId.split("-")[0];
          if (branch && !existingReport.vehicleBranches.includes(branch)) {
            existingReport.vehicleBranches.push(branch);
          }
        }

        // Update vehicleIds array with unique vehicle IDs
        if (vehicleId && !existingReport.vehicleIds.includes(vehicleId)) {
          existingReport.vehicleIds.push(vehicleId);
        }
      } else {
        // Extract branch prefix and create initial arrays
        const branch = vehicleId ? vehicleId.split("-")[0] : "";
        const vehicleBranches = branch ? [branch] : [];
        const vehicleIds = vehicleId ? [vehicleId] : [];

        acc.push({
          driver,
          vehicleBranches,
          vehicleIds,
          fuelTransactions: [
            {
              vehicleId: row.vehicleId,
              date: row.date,
              invoiceNumber: row.invoiceNumber,
              gallons: row.gallons || 0,
              cost: row.cost || 0,
              sellerState: row.sellerState,
              sellerName: row.sellerName,
              odometer: row.odometer || 0,
              receipt: row.receipt,
            },
          ],
        });
      }
      return acc;
    },
    []
  );

  return fuelReports;
}

export function getFuelExpenseDiscrepancies(
  fuelStatements: FuelStatement[],
  fuelReports: FuelReport[]
): FuelExpenseDiscrepancy[] {
  const discrepancies: FuelExpenseDiscrepancy[] = [];

  // Iterate over all statements
  for (const statement of fuelStatements) {
    // Find matching fuel report by driver name (with cleaned names)
    const cleanedCardHolderName = cleanName(statement.cardHolderName);
    const matchingFuelReport = fuelReports.find(
      (fuelReport) => cleanName(fuelReport.driver) === cleanedCardHolderName
    );

    if (matchingFuelReport) {
      // Find transactions that exist in statement but not in fuel report
      const missingTransactions = statement.transactions.filter(
        (transaction) => {
          // Check if this transaction exists in fuel report
          const matchingFuelTransaction =
            matchingFuelReport.fuelTransactions.find((fuelTransaction) =>
              isTransactionMatch(fuelTransaction, transaction)
            );

          // Return true if no matching fuel transaction was found (meaning it's missing)
          return !matchingFuelTransaction;
        }
      );

      // If there are missing transactions, add them to discrepancies
      if (missingTransactions.length > 0) {
        discrepancies.push({
          driver: statement.cardHolderName,
          Transactions: missingTransactions,
        });
      }
    }
    // Skip statements without matching fuel reports
    // (removed the else block that added all transactions as discrepancies)
  }

  return discrepancies;
}

export function getMissingFuelTransactions(
  fuelTransactions: FuelTransaction[],
  transactions: Transaction[]
): Transaction[] {
  const missingTransactions: Transaction[] = [];

  for (const transaction of transactions) {
    const matchingFuelTransaction = fuelTransactions.find((fuelTransaction) =>
      isTransactionMatch(fuelTransaction, transaction)
    );

    if (!matchingFuelTransaction) {
      missingTransactions.push(transaction);
    }
  }

  // Filter out transactions with glCodes containing "Drivers Expense" or "Repairs"
  const filteredMissingTransactions = missingTransactions.filter(
    (transaction) => {
      const glCode = transaction.glCode.toLowerCase();
      const glCodeDescription = transaction.glCodeDescription.toLowerCase();

      return !(
        glCode.includes("drivers expense") ||
        glCode.includes("repairs") ||
        glCodeDescription.includes("drivers expense") ||
        glCodeDescription.includes("repairs")
      );
    }
  );

  return filteredMissingTransactions;
}

// Helper function to clean strings of non-alphanumeric characters
function cleanString(str: string): string {
  return str ? str.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() : "";
}

// Helper function to check if states match (handles abbreviations vs full names)
function statesMatch(state1: string, state2: string): boolean {
  if (!state1 || !state2) return false;

  // State abbreviation to full name mapping
  const stateMap: { [key: string]: string } = {
    al: "alabama",
    ak: "alaska",
    az: "arizona",
    ar: "arkansas",
    ca: "california",
    co: "colorado",
    ct: "connecticut",
    de: "delaware",
    fl: "florida",
    ga: "georgia",
    hi: "hawaii",
    id: "idaho",
    il: "illinois",
    in: "indiana",
    ia: "iowa",
    ks: "kansas",
    ky: "kentucky",
    la: "louisiana",
    me: "maine",
    md: "maryland",
    ma: "massachusetts",
    mi: "michigan",
    mn: "minnesota",
    ms: "mississippi",
    mo: "missouri",
    mt: "montana",
    ne: "nebraska",
    nv: "nevada",
    nh: "newhampshire",
    nj: "newjersey",
    nm: "newmexico",
    ny: "newyork",
    nc: "northcarolina",
    nd: "northdakota",
    oh: "ohio",
    ok: "oklahoma",
    or: "oregon",
    pa: "pennsylvania",
    ri: "rhodeisland",
    sc: "southcarolina",
    sd: "southdakota",
    tn: "tennessee",
    tx: "texas",
    ut: "utah",
    vt: "vermont",
    va: "virginia",
    wa: "washington",
    wv: "westvirginia",
    wi: "wisconsin",
    wy: "wyoming",
    // Common variations
    dc: "districtofcolumbia",
    pr: "puertorico",
  };

  const cleanState1 = cleanString(state1);
  const cleanState2 = cleanString(state2);

  // Direct match
  if (cleanState1 === cleanState2) return true;

  // Check if one is abbreviation and other is full name
  const fullName1 = stateMap[cleanState1] || cleanState1;
  const fullName2 = stateMap[cleanState2] || cleanState2;

  return fullName1 === fullName2;
}

// Helper function to check if supplier names match (partial matching)
function supplierNamesMatch(supplierName: string, sellerName: string): boolean {
  if (!supplierName || !sellerName) return false;

  const cleanSupplier = cleanString(supplierName);
  const cleanSeller = cleanString(sellerName);

  // Check if either name contains the other (bidirectional partial matching)
  // Examples:
  // - "Shell Oil" contains "Shell" ✓
  // - "EXXON MOBIL" contains "Exxon" ✓
  // - "BP America Inc." contains "BP" ✓
  return (
    cleanSupplier.includes(cleanSeller) || cleanSeller.includes(cleanSupplier)
  );
}

// Helper function to check if a fuel transaction matches an expense transaction
// Uses three matching strategies:
// 1. Date + Cost match (exact amounts within $0.01)
// 2. Date + Fuel quantity match (exact gallons within 0.01)
// 3. Date + Supplier name (partial match) + State (handles abbreviations vs full names)
function isTransactionMatch(
  fuelTransaction: FuelTransaction,
  transaction: Transaction
): boolean {
  const transactionDate = new Date(transaction.transactionDate).toDateString();
  const fuelTransactionDate = new Date(fuelTransaction.date).toDateString();

  // Primary comparison: date and cost
  const dateAndCostMatch =
    transactionDate === fuelTransactionDate &&
    Math.abs(fuelTransaction.cost - transaction.billingAmount) < 0.01;

  // Secondary comparison: date and fuel quantity (if both have fuel data)
  const dateAndQuantityMatch =
    transactionDate === fuelTransactionDate &&
    transaction.fuelQuantity !== undefined &&
    Math.abs(fuelTransaction.gallons - transaction.fuelQuantity) < 0.01;

  // Enhanced tertiary comparison: date, supplier name (partial match), and state (handles abbreviations)
  const dateAndSupplierPlusStateMatch =
    transactionDate === fuelTransactionDate &&
    supplierNamesMatch(transaction.supplierName, fuelTransaction.sellerName) &&
    statesMatch(transaction.supplierState, fuelTransaction.sellerState);
    // IMPLEMENTATION NOTE: add the cost comparison with a tolerance of ~15% 

  return (
    dateAndCostMatch || dateAndQuantityMatch || dateAndSupplierPlusStateMatch
  );
}

export function getMatchingFuelTransactions(
  fuelTransactions: FuelTransaction[],
  transactions: Transaction[]
): Set<string> {
  const matchingFuelTransactionIds = new Set<string>();

  for (const fuelTransaction of fuelTransactions) {
    const matchingTransaction = transactions.find((transaction) =>
      isTransactionMatch(fuelTransaction, transaction)
    );

    if (matchingTransaction) {
      // Create a unique identifier for the fuel transaction
      const fuelTransactionId = `${fuelTransaction.vehicleId}-${fuelTransaction.date}-${fuelTransaction.invoiceNumber}`;
      matchingFuelTransactionIds.add(fuelTransactionId);
    }
  }

  return matchingFuelTransactionIds;
}

export function getMatchingTransactions(
  fuelTransactions: FuelTransaction[],
  transactions: Transaction[]
): Set<string> {
  const matchingTransactionIds = new Set<string>();

  for (const transaction of transactions) {
    const matchingFuelTransaction = fuelTransactions.find((fuelTransaction) =>
      isTransactionMatch(fuelTransaction, transaction)
    );

    if (matchingFuelTransaction) {
      matchingTransactionIds.add(transaction.transactionReference);
    }
  }

  return matchingTransactionIds;
}

export function createFuelSummaryData(data: Fuel_CSV_Row[]): FuelSummaryData {
  // Get all unique truck IDs and states
  const uniqueTruckIds = [...new Set(data.map((row) => row.vehicleId))].sort();
  const uniqueStates = [...new Set(data.map((row) => row.sellerState))].sort();

  // Create summary rows for each state
  const summaryRows: FuelSummaryRow[] = uniqueStates.map((state) => {
    // filter data for the current state
    const stateData = data.filter((row) => row.sellerState === state);

    // Calculate total gallons for this state
    const totalGallons = stateData.reduce(
      (sum, row) => sum + (row.gallons || 0),
      0
    );

    // Calculate gallons per truck ID for this state
    const truckGallons: { [truckId: string]: number } = {};

    // Initialize all truck IDs with 0
    uniqueTruckIds.forEach((truckId) => {
      truckGallons[truckId] = 0;
    });

    // Sum gallons for each truck in this state
    stateData.forEach((row) => {
      if (row.vehicleId && row.gallons) {
        truckGallons[row.vehicleId] =
          (truckGallons[row.vehicleId] || 0) + row.gallons;
      }
    });

    return {
      state,
      totalGallons,
      truckGallons,
    };
  });

  return {
    summaryRows,
    uniqueTruckIds,
  };
}
