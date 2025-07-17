"use client";
import { useFuelReports } from "@/components/data-context";
import { DataTable } from "@/components/tables/data-table";
import { FuelTransactionColumns } from "@/components/tables/fuel-transaction-columns";
import React from "react";

const FuelReportPage = () => {
  const { selectedFuelReport } = useFuelReports();

  return (
    <main className="container mx-auto py-10">
      {selectedFuelReport ? (
        <div>
          <DataTable
            columns={FuelTransactionColumns}
            data={selectedFuelReport.fuelTransactions}
          />
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-10">
          No fuel report selected
        </div>
      )}
    </main>
  );
};

export default FuelReportPage;
