import {
  Expense_CSV_Row,
  Statement,
  Fuel_CSV_Row,
  FuelReport,
  FuelExpenseDiscrepancy,
  FuelTransaction,
  Transaction,
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
          fuelQuantity: row.fuelQuantity,
          fuelType: row.fuelType,
          fuelUnitCost: row.fuelUnitCost,
          odometerReading: row.odometerReading,
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
              fuelQuantity: row.fuelQuantity,
              fuelType: row.fuelType,
              fuelUnitCost: row.fuelUnitCost,
              odometerReading: row.odometerReading,
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

export function createFuelReports(data: Fuel_CSV_Row[]): FuelReport[] {
  // Group fuel transactions by driver name
  const fuelReports: FuelReport[] = data.reduce(
    (acc: FuelReport[], row: Fuel_CSV_Row) => {
      const { driver } = row;

      const existingReport = acc.find((report) => report.driver === driver);

      if (existingReport) {
        existingReport.fuelTransactions.push({
          vehicleId: row.vehicleId,
          date: new Date(row.date),
          invoiceNumber: row.invoiceNumber,
          gallons: parseFloat(row.gallons) || 0,
          cost: parseFloat(row.cost) || 0,
          sellerState: row.sellerState,
          sellerName: row.sellerName,
          odometer: parseFloat(row.odometer) || 0,
          receipt: row.receipt,
        });
      } else {
        acc.push({
          driver,
          fuelTransactions: [
            {
              vehicleId: row.vehicleId,
              date: new Date(row.date),
              invoiceNumber: row.invoiceNumber,
              gallons: parseFloat(row.gallons) || 0,
              cost: parseFloat(row.cost) || 0,
              sellerState: row.sellerState,
              sellerName: row.sellerName,
              odometer: parseFloat(row.odometer) || 0,
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
  statements: Statement[],
  fuelReports: FuelReport[]
): FuelExpenseDiscrepancy[] {
  const discrepancies: FuelExpenseDiscrepancy[] = [];

  // Iterate over all statements
  for (const statement of statements) {
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
            matchingFuelReport.fuelTransactions.find((fuelTransaction) => {
              // Compare transaction date and amount
              const transactionDate = new Date(transaction.transactionDate);
              const fuelTransactionDate = fuelTransaction.date;

              // Compare dates (same day) and amounts (billing amount vs cost)
              return (
                transactionDate.toDateString() ===
                  fuelTransactionDate.toDateString() &&
                Math.abs(transaction.billingAmount - fuelTransaction.cost) <
                  0.01 // Small tolerance for floating point comparison
              );
            });

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
    const matchingFuelTransaction = fuelTransactions.find(
      (fuelTransaction) =>
        new Date(fuelTransaction.date).toDateString() ===
          new Date(transaction.transactionDate).toDateString() &&
        fuelTransaction.cost === transaction.billingAmount
    );

    if (!matchingFuelTransaction) {
      missingTransactions.push(transaction);
    }
  }

  return missingTransactions;
}
