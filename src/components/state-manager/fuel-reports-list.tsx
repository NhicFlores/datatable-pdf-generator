"use client";

import { DataTable } from "@/components/tables/data-table";
import { createFuelReportSummaryColumns } from "@/components/tables/fuel-report-summary-columns";
import React from "react";
import { FuelReportSummary } from "@/lib/data-model/query-types";

interface FuelReportsListProps {
  fuelReportSummaries: FuelReportSummary[];
  selectedQuarter?: string;
}

export function FuelReportsList({
  fuelReportSummaries,
  selectedQuarter,
}: FuelReportsListProps) {
  // Create columns with quarter context
  const columnsWithQuarter = React.useMemo(
    () => createFuelReportSummaryColumns(selectedQuarter),
    [selectedQuarter]
  );

  return (
    <div>
      <DataTable columns={columnsWithQuarter} data={fuelReportSummaries} />
    </div>
  );
}
