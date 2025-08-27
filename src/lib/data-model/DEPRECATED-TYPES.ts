// DEPRECATED
export type Expense_CSV_Row = {
  employeeId: string;
  employeeFirstName: string;
  employeeLastName: string;
  employeeCompanyUnit: string;
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
  workflowStatus: string;
  supplierName: string;
  supplierCity: string;
  supplierState: string;
  merchantCategoryCode?: string;
  odometerReading?: number; // parse into number
  fuelQuantity?: number;
  fuelType?: string;
  fuelUnitCost?: number; // parse into number
  fuelUnitOfMeasure?: string;
};

// DEPRECATED
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

export type FuelReport_DEPRECATED = {
  driver: string;
  vehicleBranches: string[];
  vehicleIds: string[];
  fuelTransactions: FuelTransaction[];
};

export type FuelStatement = {
  cardHolderName: string;
  transactions: Transaction[];
};

export type FuelExpenseDiscrepancy = {
  driver: string;
  Transactions: Transaction[];
};

export type FuelSummaryRow = {
  state: string;
  totalGallons: number;
  truckGallons: { [truckId: string]: number };
};

export type FuelSummaryData = {
  summaryRows: FuelSummaryRow[];
  uniqueTruckIds: string[];
};