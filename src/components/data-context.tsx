"use client";
import {
  createStatements,
  createFuelReports,
  createFuelStatements,
} from "@/lib/data";
import {
  Expense_CSV_Row,
  Statement,
  Fuel_CSV_Row,
  FuelReport,
  FuelStatement,
  FuelTransaction,
  Transaction,
  FuelSummaryData,
  FuelSummaryRow,
} from "@/lib/types";
import React, { createContext, useContext } from "react";

interface StatementsContextType {
  statements: Statement[];
  selectedStatement: Statement | null;
  setSelectedStatement: (statement: Statement | null) => void;
  fuelReports: FuelReport[];
  selectedFuelReport: FuelReport | null;
  setSelectedFuelReport: (fuelReport: FuelReport | null) => void;
  fuelStatements: FuelStatement[];
  selectedFuelStatement: FuelStatement | null;
  setSelectedFuelStatement: (fuelStatement: FuelStatement | null) => void;
  addTransactionToFuelReport: (transaction: Transaction) => void;
  updateFuelTransactionField: (
    transactionId: string,
    field: keyof FuelTransaction,
    value: string | number
  ) => void;
  getFuelSummaryData: () => FuelSummaryData;
}

// initialize context
const StatementsContext = createContext<StatementsContextType | undefined>(
  undefined
);

// custom hook to use the context
export const useStatements = () => {
  const context = useContext(StatementsContext);
  if (!context)
    throw new Error("useStatements must be used within StatementsProvider");
  return context;
};

// custom hook specifically for fuel reports
export const useFuelReports = () => {
  const context = useContext(StatementsContext);
  if (!context)
    throw new Error("useFuelReports must be used within StatementsProvider");
  return {
    fuelReports: context.fuelReports,
    selectedFuelReport: context.selectedFuelReport,
    setSelectedFuelReport: context.setSelectedFuelReport,
  };
};

// custom hook specifically for fuel statements
export const useFuelStatements = () => {
  const context = useContext(StatementsContext);
  if (!context)
    throw new Error("useFuelStatements must be used within StatementsProvider");
  return {
    fuelStatements: context.fuelStatements,
    selectedFuelStatement: context.selectedFuelStatement,
    setSelectedFuelStatement: context.setSelectedFuelStatement,
  };
};

// custom hook for fuel report actions
export const useFuelReportActions = () => {
  const context = useContext(StatementsContext);
  if (!context)
    throw new Error(
      "useFuelReportActions must be used within StatementsProvider"
    );
  return {
    addTransactionToFuelReport: context.addTransactionToFuelReport,
    updateFuelTransactionField: context.updateFuelTransactionField,
  };
};

// custom hook for fuel summary data
export const useFuelSummary = () => {
  const context = useContext(StatementsContext);
  if (!context)
    throw new Error("useFuelSummary must be used within StatementsProvider");
  return {
    getFuelSummaryData: context.getFuelSummaryData,
  };
};

interface StatementsProviderProps {
  data: Expense_CSV_Row[];
  fuelData: Fuel_CSV_Row[];
  children: React.ReactNode;
}

// provider component to wrap around the app
export const StatementsProvider = ({
  data,
  fuelData,
  children,
}: StatementsProviderProps) => {
  const statements = createStatements(data);
  const [fuelReports, setFuelReports] = React.useState<FuelReport[]>(
    createFuelReports(fuelData)
  );
  const fuelStatements = createFuelStatements(data);
  const [selectedStatement, setSelectedStatement] =
    React.useState<Statement | null>(null);
  const [selectedFuelReport, setSelectedFuelReport] =
    React.useState<FuelReport | null>(null);
  const [selectedFuelStatement, setSelectedFuelStatement] =
    React.useState<FuelStatement | null>(null);

  const addTransactionToFuelReport = React.useCallback(
    (transaction: Transaction) => {
      if (!selectedFuelReport) return;

      // Create a new fuel transaction from the expense transaction
      const newFuelTransaction: FuelTransaction = {
        vehicleId:
          selectedFuelReport.fuelTransactions[0]?.vehicleId || "Unknown", // Use first vehicle ID as default
        date: transaction.transactionDate,
        invoiceNumber: `INV-${Date.now()}`, // Generate a unique invoice number
        gallons: 0, // Default to 0, will be editable
        cost: transaction.billingAmount,
        sellerState: transaction.supplierState,
        sellerName: transaction.supplierName,
        odometer: 0, // Default value
        receipt: "", // Empty for now
      };

      // Update the fuel reports
      setFuelReports((prevReports) => {
        const updatedReports = prevReports.map((report) => {
          if (report.driver === selectedFuelReport.driver) {
            return {
              ...report,
              fuelTransactions: [
                ...report.fuelTransactions,
                newFuelTransaction,
              ],
            };
          }
          return report;
        });
        return updatedReports;
      });

      // Update the selected fuel report
      setSelectedFuelReport((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          fuelTransactions: [...prev.fuelTransactions, newFuelTransaction],
        };
      });
    },
    [selectedFuelReport]
  );

  const updateFuelTransactionField = React.useCallback(
    (
      transactionId: string,
      field: keyof FuelTransaction,
      value: string | number
    ) => {
      if (!selectedFuelReport) return;

      // Update the fuel reports
      setFuelReports((prevReports) => {
        const updatedReports = prevReports.map((report) => {
          if (report.driver === selectedFuelReport.driver) {
            return {
              ...report,
              fuelTransactions: report.fuelTransactions.map((transaction) => {
                const txId = `${transaction.vehicleId}-${transaction.date}-${transaction.invoiceNumber}`;
                if (txId === transactionId) {
                  return { ...transaction, [field]: value };
                }
                return transaction;
              }),
            };
          }
          return report;
        });
        return updatedReports;
      });

      // Update the selected fuel report
      setSelectedFuelReport((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          fuelTransactions: prev.fuelTransactions.map((transaction) => {
            const txId = `${transaction.vehicleId}-${transaction.date}-${transaction.invoiceNumber}`;
            if (txId === transactionId) {
              return { ...transaction, [field]: value };
            }
            return transaction;
          }),
        };
      });
    },
    [selectedFuelReport]
  );

  const getFuelSummaryData = React.useCallback((): FuelSummaryData => {
    // Flatten all fuel transactions from all reports
    const allTransactions = fuelReports.flatMap(
      (report) => report.fuelTransactions
    );

    // Get all unique truck IDs and states
    const uniqueTruckIds = [
      ...new Set(allTransactions.map((t) => t.vehicleId)),
    ].sort();
    const uniqueStates = [
      ...new Set(allTransactions.map((t) => t.sellerState)),
    ].sort();

    // Create summary rows for each state
    const summaryRows: FuelSummaryRow[] = uniqueStates.map((state) => {
      // Filter transactions for the current state
      const stateTransactions = allTransactions.filter(
        (t) => t.sellerState === state
      );

      // Calculate total gallons for this state
      const totalGallons = stateTransactions.reduce(
        (sum, t) => sum + (t.gallons || 0),
        0
      );

      // Calculate gallons per truck ID for this state
      const truckGallons: { [truckId: string]: number } = {};

      // Initialize all truck IDs with 0
      uniqueTruckIds.forEach((truckId) => {
        truckGallons[truckId] = 0;
      });

      // Sum gallons for each truck in this state
      stateTransactions.forEach((t) => {
        if (t.vehicleId && t.gallons) {
          truckGallons[t.vehicleId] =
            (truckGallons[t.vehicleId] || 0) + t.gallons;
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
  }, [fuelReports]);

  return (
    <StatementsContext.Provider
      value={{
        statements,
        selectedStatement,
        setSelectedStatement,
        fuelReports,
        selectedFuelReport,
        setSelectedFuelReport,
        fuelStatements,
        selectedFuelStatement,
        setSelectedFuelStatement,
        addTransactionToFuelReport,
        updateFuelTransactionField,
        getFuelSummaryData,
      }}
    >
      {children}
    </StatementsContext.Provider>
  );
};
