"use client";
import { useFuelReports } from "@/components/data-context";
import { DataTable } from "@/components/tables/data-table";
import { FuelReportColumns } from "@/components/tables/fuel-driver-columns";
import { AllFuelTransactionsExportButton } from "@/components/all-fuel-transactions-export-button";
import React from "react";
import Link from "next/link";
import { FuelReportSummaryRoute } from "@/lib/routes";

const FuelReportsPage = () => {
    const { fuelReports } = useFuelReports();
  return (
  <main className="container mx-auto py-10 space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href={FuelReportSummaryRoute.page} className="border p-1 rounded hover:bg-gray-100">
          View Summary
        </Link>
      </div>
      <AllFuelTransactionsExportButton
        filename="updated-fuel-report.csv"
        label="Download Updated Report"
        size="sm"
        variant="outline"
      />
    </div>
    <div>
        <DataTable columns={FuelReportColumns} data={fuelReports} />
    </div>
</main>
)
};

export default FuelReportsPage;
