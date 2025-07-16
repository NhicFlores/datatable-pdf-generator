import { Expense_CSV_Row, Statement } from "./types";

export function createStatementsTEST(data: Expense_CSV_Row[]): Statement[] {
  // Group transactions by cardHolderName
  const statements: Statement[] = data.reduce(
    (acc: Statement[], row: Expense_CSV_Row) => {
      const {
        statementPeriodStartDate,
        statementPeriodEndDate,
        cardHolderName,
        lastFourDigits,
      } = row;

      const existingStatement = acc.find(
        (statement) =>
          statement.cardHolderName === cardHolderName &&
          statement.statementPeriodStartDate === statementPeriodStartDate &&
          statement.statementPeriodEndDate === statementPeriodEndDate &&
          statement.lastFourDigits === lastFourDigits // we can remove lastFour from Statement type and just show all credit card numbers in case of multiple cards
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
        });
      } else {
        acc.push({
          statementPeriodStartDate,
          statementPeriodEndDate,
          lastFourDigits,
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
