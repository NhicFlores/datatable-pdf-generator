import {
  BaseFuelLog,
  SelectDriver,
  SelectFuelLog,
  SelectTransaction,
} from "./schema-types";

export type FuelReport = Omit<SelectDriver, "createdAt" | "updatedAt"> & {
  vehicleIds: string[];
  fuelLogs: BaseFuelLog[];
};

// Define the exact return type for fuel transactions with driver info
export type FuelLogWithDriver = Omit<SelectFuelLog, "driverId"> & {
  driverId: string;
  driverName: string | null;
  driverBranch: string | null;
};

// Summary type for list page performance optimization
export type FuelReportSummary = SelectDriver & {
  vehicleIds: string[];
};

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

// Enhanced FuelReport with matching data
export type FuelReportWithMatches = FuelReport & {
  matchedTransactionIds: Set<string>;
  matchedFuelLogIds: Set<string>;
  matches: MatchSummary[];
};

// Fuel summary data for dashboard/summary page
export type FuelSummaryData = {
  totalDrivers: number;
  totalTransactions: number;
  totalGallons: number;
  totalCost: number;
  summaryByState: FuelSummaryByState[];
  summaryByVehicle: FuelSummaryByVehicle[];
};

export type FuelSummaryByState = {
  state: string;
  totalGallons: number;
  totalCost: number;
  transactionCount: number;
  uniqueVehicles: number;
};

export type FuelSummaryByVehicle = {
  vehicleId: string;
  driverName: string;
  totalGallons: number;
  totalCost: number;
  transactionCount: number;
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
