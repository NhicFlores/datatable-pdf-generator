import {
  Expense_CSV_Row,
  Statement,
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

export function createStatements(data: Expense_CSV_Row[]): Statement[] {
  // Group transactions by employeeId
  const statements: Statement[] = data.reduce(
    (acc: Statement[], row: Expense_CSV_Row) => {
      const {
        statementPeriodStartDate,
        statementPeriodEndDate,
        employeeId,
        employeeFirstName,
        employeeLastName,
        cardHolderName,
        lastFourDigits,
      } = row;

      const existingStatement = acc.find(
        (statement) =>
          statement.employeeId === employeeId &&
          statement.statementPeriodStartDate === statementPeriodStartDate &&
          statement.statementPeriodEndDate === statementPeriodEndDate
      );

      if (existingStatement) {
        existingStatement.transactions.push({
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
          statementPeriodStartDate,
          statementPeriodEndDate,
          employeeId,
          employeeFirstName,
          employeeLastName,
          cardHolderName,
          lastFourDigits,
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

  return statements;
}

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

      const vehicleBranch = vehicleId ? vehicleId.split("-")[0] : "";

      const existingReport = acc.find(
        (report) =>
          report.driver === driver && report.vehicleBranch === vehicleBranch
      );

      if (existingReport) {
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
      } else {
        acc.push({
          driver,
          vehicleBranch,
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

// Helper function to check if a fuel transaction matches an expense transaction
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

  return dateAndCostMatch || dateAndQuantityMatch;
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
