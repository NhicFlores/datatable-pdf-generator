import { getFuelCsvData } from "@/lib/read-fuel-csv";
import { createFuelSummaryData } from "@/lib/data";
import { FuelSummaryTable } from "@/components/tables/fuel-summary-table";

export default async function FuelSummaryPage() {
  // Load fuel data
  const fuelData = await getFuelCsvData();

  // Generate summary data
  const summaryData = createFuelSummaryData(fuelData);

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
          </div>

          <FuelSummaryTable summaryData={summaryData} />
        </div>
      </div>
    </main>
  );
}
