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
    <div>
      <DataTable
        columns={FuelReportSummaryColumns}
        data={fuelReportSummaries}
      />
    </div>
  );
}
