"use client";

import { DataTable } from "@/components/tables/data-table";
import { FuelReportSummaryColumns } from "@/components/tables/fuel-report-summary-columns";
import React from "react";
import { FuelReportSummary } from "@/lib/data-model/query-types";

interface FuelReportsListProps {
  fuelReportSummaries: FuelReportSummary[];
}

export function FuelReportsList({ fuelReportSummaries }: FuelReportsListProps) {
  return (
    <main className="container mx-auto py-10 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fuel Reports</h1>
        <p className="text-muted-foreground">
          View and manage fuel report summaries
        </p>
      </div>

      {/* Data Table */}
      <div>
        <DataTable
          columns={FuelReportSummaryColumns}
          data={fuelReportSummaries}
        />
      </div>
    </main>
  );
}
