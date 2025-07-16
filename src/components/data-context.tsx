"use client";
import { createStatements } from "@/lib/data";
import { Expense_CSV_Row, Statement } from "@/lib/types";
import React, { createContext, useContext } from "react";

interface StatementsContextType {
  statements: Statement[];
  selectedStatement: Statement | null;
  setSelectedStatement: (statement: Statement | null) => void;
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

interface StatementsProviderProps {
  data: Expense_CSV_Row[];
  children: React.ReactNode;
}

// provider component to wrap around the app
export const StatementsProvider = ({
  data,
  children,
}: StatementsProviderProps) => {
  const statements = createStatements(data);
  const [selectedStatement, setSelectedStatement] =
    React.useState<Statement | null>(null);

  return (
    <StatementsContext.Provider
      value={{ statements, selectedStatement, setSelectedStatement }}
    >
      {children}
    </StatementsContext.Provider>
  );
};
