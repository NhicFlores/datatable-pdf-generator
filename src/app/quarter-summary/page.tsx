export const revalidate = 60;
import { getFuelSummaryTableFromDB } from "@/lib/db/data-fetchers";
import { FuelSummaryTable } from "@/components/tables/fuel-summary-table";
import { FuelSummaryExportButton } from "@/components/csv/fuel-summary-export-button";
import { requireAuth } from "@/auth";
import Header from "@/components/header";
import { getCurrentYearQuarters } from "@/lib/actions/quarter-data-actions";
import { getQuarterDateRangeFromQuarters } from "@/lib/utils/quarter-utils";
import { QuarterSelector } from "@/components/quarter-selector";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ quarter?: string }>;
}

// Server Component - pre-fetches fuel summary data
export default async function FuelSummaryPage({ searchParams }: PageProps) {
  // Ensure user is authenticated
  await requireAuth();

  const params = await searchParams;

  // Get quarter data for selector
  const { currentQuarter, currentQuarterDateRange, quarters } =
    await getCurrentYearQuarters();

  // Use selected quarter from URL or default to current quarter
  const selectedQuarter = params.quarter || currentQuarter;

  // Get date range for selected quarter
  const selectedDateRange = params.quarter
    ? getQuarterDateRangeFromQuarters(params.quarter, quarters)
    : currentQuarterDateRange;

  // Fetch data for selected quarter
  const summaryData = await getFuelSummaryTableFromDB(selectedDateRange);

  const handleQuarterChange = async (quarter: string) => {
    "use server";
    // Redirect to update URL with selected quarter
    redirect(`/quarter-summary?quarter=${quarter}`);
  };

  // Check if there's any data to display
  const hasData = summaryData.summaryRows.length > 0;

  if (!hasData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="space-y-6">
            {/* Quarter Selector */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Fuel Report Summary
                </h1>
                <p className="text-muted-foreground">
                  Fuel consumption summary by state and truck ID for {selectedQuarter}
                </p>
              </div>
              <QuarterSelector
                currentQuarter={selectedQuarter}
                quarters={quarters}
                onQuarterChange={handleQuarterChange}
              />
            </div>
            
            <div className="text-center">
              <p className="text-muted-foreground">No fuel data available for {selectedQuarter}.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Quarter Selector */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Fuel Report Summary
              </h1>
              <p className="text-muted-foreground">
                Fuel consumption summary by state and truck ID for {selectedQuarter}
              </p>
            </div>
            <QuarterSelector
              currentQuarter={selectedQuarter}
              quarters={quarters}
              onQuarterChange={handleQuarterChange}
            />
          </div>

          {/* Export Controls Section */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-md font-medium text-gray-900">
                  Export Options
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Download summary data for {selectedQuarter}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <FuelSummaryExportButton
                  summaryData={summaryData}
                  filename={`fuel_summary_${selectedQuarter}_${
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
                Total gallons consumed per state with breakdown by truck ID for {selectedQuarter}
              </p>
            </div>

            <FuelSummaryTable summaryData={summaryData} />
          </div>
        </div>
      </main>
    </div>
  );
}
