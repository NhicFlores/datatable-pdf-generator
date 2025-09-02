export const revalidate = 60;
import { getFuelSummaryTableFromDB } from "@/lib/db/data-fetchers";
import { FuelSummaryTable } from "@/components/tables/fuel-summary-table";
import { FuelSummaryExportButton } from "@/components/csv/fuel-summary-export-button";
// import { AllFuelTransactionsExportButton } from "@/components/all-fuel-transactions-export-button";

// Server Component - pre-fetches fuel summary data
export default async function FuelSummaryPage() {
  const summaryData = await getFuelSummaryTableFromDB();

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

        {/* Export Controls Section */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-md font-medium text-gray-900">
                Export Options
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Download summary data or the complete updated fuel report
              </p>
            </div>
            <div className="flex items-center gap-3">
              <FuelSummaryExportButton
                summaryData={summaryData}
                filename={`fuel_summary_${
                  new Date().toISOString().split("T")[0]
                }.csv`}
                label="Export Summary"
                variant="outline"
                size="sm"
              />
              {/* <AllFuelTransactionsExportButton
                filename="updated-fuel-report.csv"
                label="Download Updated Report"
                variant="default"
                size="sm"
              /> */}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">
              Summary by State and Truck
            </h2>
            <p className="text-sm text-muted-foreground">
              Total gallons consumed per state with breakdown by truck ID
            </p>
          </div>

          <FuelSummaryTable summaryData={summaryData} />
        </div>
      </div>
    </main>
  );
}
