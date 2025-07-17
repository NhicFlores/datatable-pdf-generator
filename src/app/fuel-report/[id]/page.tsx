"use client";
import { useFuelReports, useFuelStatements } from "@/components/data-context";
import { DataTable } from "@/components/tables/data-table";
import { FuelStatementColumns } from "@/components/tables/fuel-statement-columns";
import { FuelTransactionColumns } from "@/components/tables/fuel-transaction-columns";

import { getMissingFuelTransactions } from "@/lib/data";
import React from "react";

const FuelReportPage = () => {
  const { selectedFuelReport } = useFuelReports();
  const { selectedFuelStatement } = useFuelStatements();

  const fuelTransactionDiscrepancies = getMissingFuelTransactions(
    selectedFuelReport?.fuelTransactions || [],
    selectedFuelStatement?.transactions || []
  );

  return (
    <main className="container mx-auto py-10 space-y-4">
      <section>
        {selectedFuelStatement ? (
          <div>
            <DataTable
              columns={FuelStatementColumns}
              data={fuelTransactionDiscrepancies}
            />
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-10">
            No statement selected
          </div>
        )}
      </section>
      <section>
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
      </section>
    </main>
  );
};

export default FuelReportPage;
