import {
  SelectDriver,
  SelectFuelLog,
  SelectTransaction,
  UserListItem,
  UserSummary,
  CreatedUser,
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
};

// Type for filtered fuel logs on fuel-logs page
export type FilteredFuelLog = {
  id: string;
  vehicleId: string;
  driverId: string;
  driver: string | null;
  date: Date;
  invoiceNumber: string;
  gallons: string;
  cost: string;
  sellerState: string;
  sellerName: string;
  odometer: string;
  receipt: string | null;
  createdAt: Date;
  updatedAt: Date;
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

// Admin dashboard related types
export type GetAllUsersResult =
  | { success: true; users: UserListItem[] }
  | { success: false; error: string };

export type CreateUserResult =
  | { success: true; user: CreatedUser }
  | { success: false; error: string };

export type GetUserResult =
  | { success: true; user: UserSummary }
  | { success: false; error: string };

export type UpdateUserResult =
  | { success: true; user: Partial<UserSummary> }
  | { success: false; error: string };
