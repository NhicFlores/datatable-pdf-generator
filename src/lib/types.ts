export type Expense_CSV_Row = {
  statementPeriodStartDate: string;
  statementPeriodEndDate: string;
  employeeId: string;
  employeeFirstName: string;
  employeeLastName: string;
  cardHolderName: string;
  lastFourDigits: string;
  transactionReference: string;
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
  merchantCategoryCode?: string;
  odometerReading?: number; // parse into number
  fuelQuantity?: number;
  fuelType?: string;
  fuelUnitCost?: number; // parse into number
  fuelUnitOfMeasure?: string;
};

export type Statement = {
  statementPeriodStartDate: string;
  statementPeriodEndDate: string;
  lastFourDigits: string;
  cardHolderName: string;
  employeeId?: string;
  employeeFirstName?: string;
  employeeLastName?: string;
  // totalAmount: number;
  transactions: Transaction[];
};

export type Transaction = {
  transactionReference: string;
  cardholderName: string;
  lastFourDigits: string;
  transactionDate: string; // parse into date
  postingDate: string; // parse into date
  billingAmount: number; // parse into number
  lineAmount: number; // parse into number
  lineNumber: number; // parse into number
  glCode: string;
  glCodeDescription: string;
  reasonForExpense: string;
  receiptImageName: string;
  receiptImageReferenceId: string;
  supplierName: string;
  supplierCity: string;
  supplierState: string;
  workflowStatus: string;
  merchantCategoryCode?: string;
  odometerReading?: number; // parse into number
  fuelQuantity?: number;
  fuelType?: string;
  fuelUnitCost?: number; // parse into number 
  fuelUnitOfMeasure?: string;
};

export type FuelStatement = {
  cardHolderName: string;
  transactions: Transaction[];
}

export type Fuel_CSV_Row = {
  vehicleId: string;
  driver: string;
  date: string;
  invoiceNumber: string;
  gallons: number;
  cost: number;
  sellerState: string;
  sellerName: string;
  odometer: number;
  receipt: string;
};

export type FuelTransaction = {
  vehicleId: string;
  date: string; // parse into date
  invoiceNumber: string;
  gallons: number; // parse into number
  cost: number; // parse into number
  sellerState: string;
  sellerName: string;
  odometer: number; // parse into number
  receipt: string;
};

export type FuelReport = {
  driver: string;
  vehicleBranch: string;
  fuelTransactions: FuelTransaction[];
};

export type FuelExpenseDiscrepancy = {
  driver: string;
  Transactions: Transaction[];
};

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
