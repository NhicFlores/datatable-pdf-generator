export interface Expense {
  cardHolderName: string;
  statementPeriodStartDate: string;
  statementPeriodEndDate: string;
  lastFourDigits: string;
  currentDate: string;
  supplier: string;
  supplierAddress: string;
  amount: string;
}

export type Statement = {
  statementPeriodStartDate: string;
  statementPeriodEndDate: string;
  lastFourDigits: string;
  cardHolderName: string;
  totalAmount: string;
  transactions: Transaction[];
};

export type Transaction = {
  transactionDate: string;
  postingDate: string;
  billingAmount: string;
  lineAmount: string;
  lineNumber: string;
  glCode: string;
  glCodeDescription: string;
  reasonForExpense: string;
  receiptImageName: string;
  receiptImageReferenceId: string;
  supplierName: string;
  supplierCity: string;
  supplierState: string;
  workflowStatus: string;
};

export type CSV_Row = {
  statementPeriodStartDate: string;
  statementPeriodEndDate: string;
  lastFourDigits: string;
  cardHolderName: string;
  transactionDate: string;
  postingDate: string;
  billingAmount: string;
  lineAmount: string;
  lineNumber: string;
  glCode: string;
  glCodeDescription: string;
  reasonForExpense: string;
  receiptImageName: string;
  receiptImageReferenceId: string;
  supplierName: string;
  supplierCity: string;
  supplierState: string;
  workflowStatus: string;
}

export const column_names = [
  "Statement Period - Start Date",
  "Statement Period - End Date",
  "Account - Last Four Digits",
  "Cardholder Name",
  "Transaction - Transaction Date",
  "Transaction - Posting Date",
  "Transaction - Billing Amount",
  "Transaction - Line Amount",
  "Transaction - Line Number",
  "Transaction Line Coding - GL Code",
  "Transaction Line Coding Description - GL Code",
  "Transaction - Reason for Expense",
  "Transaction - Receipt Image Name",
  "Transaction - Receipt Image Reference ID",
  "Supplier - Name",
  "Supplier - City",
  "Supplier - State",
  "Transaction - Workflow Status",
];
