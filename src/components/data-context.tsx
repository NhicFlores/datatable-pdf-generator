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
  const fuelReports = createFuelReports(fuelData);
  const fuelStatements = createFuelStatements(data);
  const [selectedStatement, setSelectedStatement] =
    React.useState<Statement | null>(null);
  const [selectedFuelReport, setSelectedFuelReport] =
    React.useState<FuelReport | null>(null);
  const [selectedFuelStatement, setSelectedFuelStatement] =
    React.useState<FuelStatement | null>(null);

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
      }}
    >
      {children}
    </StatementsContext.Provider>
  );
};
