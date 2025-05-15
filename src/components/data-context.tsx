"use client";
import { createStatements } from "@/lib/data";
import { CSV_Row, Statement } from "@/lib/types";
import React, { createContext, useContext } from "react";

// initialize context
const StatementsContext = createContext<Statement[] | undefined>(undefined);

// custom hook to use the context
export const useStatements = () => {
  const context = useContext(StatementsContext);
  if (!context)
    throw new Error("useStatements must be used within StatementsProvider");
  return context;
};

interface StatementsProviderProps {
  data: CSV_Row[];
  children: React.ReactNode;
}

// provider component to wrap around the app
export const StatementsProvider = ({
  data,
  children,
}: StatementsProviderProps) => {
  // const [statements, setStatements] = React.useState<Statement[]>(
  //   createStatements(data)
  // );
  const statements = createStatements(data);

  return (
    <StatementsContext.Provider value={statements}>
      {children}
    </StatementsContext.Provider>
  );
};
