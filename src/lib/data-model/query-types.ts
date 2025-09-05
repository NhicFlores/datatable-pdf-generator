import {
  SelectDriver,
  SelectFuelLog,
  SelectTransaction,
} from "./schema-types";

// TODO: REMOVE USAGE OF BaseFuelLog 
export type FuelReport = Omit<SelectDriver, "createdAt" | "updatedAt"> & {
  vehicleIds: string[];
  fuelLogs: SelectFuelLog[];
};

// Summary type for list page performance optimization
export type FuelReportSummary = SelectDriver & {
  vehicleIds: string[];
};

export type DriverLogs = {
  driverId: string;
  driverName: string;
  fuelLogs: SelectFuelLog[];
}

// Type for driver-specific transaction queries with matching data
export type DriverTransactions = {
  driverId: string;
  driverName: string;
  transactions: SelectTransaction[];
  matchedTransactionIds: Set<string>;
  matchedFuelLogIds: Set<string>;
  matches: MatchSummary[];
};

// Matching summary for UI display
export type MatchSummary = {
  transactionId: string;
  fuelLogId: string;
  matchType: string;
  confidence: number;
  isActive: boolean;
};

// New types that match the deprecated FuelSummaryData structure
export type FuelSummaryRow = {
  state: string;
  totalGallons: number;
  truckGallons: { [truckId: string]: number };
};

export type FuelSummaryTableData = {
  summaryRows: FuelSummaryRow[];
  uniqueTruckIds: string[];
};
