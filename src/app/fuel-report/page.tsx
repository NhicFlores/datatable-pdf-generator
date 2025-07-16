"use client";
import { useFuelReports } from "@/components/data-context";
import { DataTable } from "@/components/tables/data-table";
import { FuelReportColumns } from "@/components/tables/fuel-summary-columns";
import React from "react";

const FuelReportsPage = () => {
    const { fuelReports } = useFuelReports();
  return (
  <main>
    <div>
        <DataTable columns={FuelReportColumns} data={fuelReports} />
    </div>
</main>
)
};

export default FuelReportsPage;
