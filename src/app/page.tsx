"use client";
import { useStatements } from "@/components/data-context";
import { DataTable } from "@/components/tables/data-table";
import { StatementColumns } from "@/components/tables/statement-columns";
import { BulkDownloadButton } from "@/components/bulk-download-button";
import { FuelDiscrepancyButton } from "@/components/fuel-discrepancy-button";

export default function Home() {
  const { statements, fuelReports } = useStatements();

  return (
    <main className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <BulkDownloadButton statements={statements} />
          <FuelDiscrepancyButton
            statements={statements}
            fuelReports={fuelReports}
          />
        </div>
      </div>
      <div>
        <DataTable columns={StatementColumns} data={statements} />
      </div>
    </main>
  );
}
