"use client";

import { FuelSummaryTable } from "@/components/tables/fuel-summary-table";
import { FuelSummaryExportButton } from "@/components/fuel-summary-export-button";
import { useMemo } from "react";
import { FuelSummaryData } from "@/lib/types";
import { useFuelSummary } from "@/components/data-context";

export default function FuelSummaryPage() {
  const { getFuelSummaryData } = useFuelSummary();

  // Get live summary data
  const summaryData: FuelSummaryData = useMemo(() => {
    return getFuelSummaryData();
  }, [getFuelSummaryData]);

  // Check if there's any data to display
  const hasData = summaryData.summaryRows.length > 0;

  if (!hasData) {
    return (
      <main className="container mx-auto py-10">
        <div className="text-center">
          <p>No fuel data available.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Fuel Report Summary
          </h1>
          <p className="text-muted-foreground">
            Fuel consumption summary by state and truck ID
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Summary by State and Truck
              </h2>
              <p className="text-sm text-muted-foreground">
                Total gallons consumed per state with breakdown by truck ID
              </p>
            </div>
            <FuelSummaryExportButton
              summaryData={summaryData}
              filename={`fuel_summary_${
                new Date().toISOString().split("T")[0]
              }.csv`}
              label="Export Summary"
            />
          </div>

          <FuelSummaryTable summaryData={summaryData} />
        </div>
      </div>
    </main>
  );
}
