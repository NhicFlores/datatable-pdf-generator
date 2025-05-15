import { CSV_Row, Statement } from "./types";

export function createStatements(data: CSV_Row[]): Statement[] {
  // Group transactions by cardHolderName
  const statements: Statement[] = data.reduce((acc: Statement[], row: CSV_Row) => {
    const { statementPeriodStartDate, statementPeriodEndDate, cardHolderName, lastFourDigits } = row;

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
  }, []);

  return statements;
}

// export async function getTransactions() {
//   const transactions = await getCsvData();

//   return transactions.map((transaction) => ({
//     cardholderName: transaction.cardHolderName,
//     lastFourDigits: transaction.lastFourDigits,
//     transactionDate: transaction.transactionDate,
//     postingDate: transaction.postingDate,
//     billingAmount: transaction.billingAmount,
//     lineAmount: transaction.lineAmount,
//     lineNumber: transaction.lineNumber,
//     glCode: transaction.glCode,
//     glCodeDescription: transaction.glCodeDescription,
//     reasonForExpense: transaction.reasonForExpense,
//     receiptImageName: transaction.receiptImageName,
//     receiptImageReferenceId: transaction.receiptImageReferenceId,
//     supplierName: transaction.supplierName,
//     supplierCity: transaction.supplierCity,
//     supplierState: transaction.supplierState,
//     workflowStatus: transaction.workflowStatus,
//   }));
// }
