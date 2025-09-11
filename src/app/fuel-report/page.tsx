export const revalidate = 60;
import { getFuelReportSummariesFromDB } from "@/lib/db/data-fetchers";
import { FuelReportsList } from "@/components/state-manager/fuel-reports-list";
import { requireAuth } from "@/auth";
import Header from "@/components/header";
import { getCurrentYearQuarters } from "@/lib/actions/quarter-data-actions";
import { QuarterSelector } from "@/components/quarter-selector";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ quarter?: string }>;
}

// Server Component - fetches fuel report summaries
export default async function FuelReportsPage({ searchParams }: PageProps) {
  // Ensure user is authenticated
  await requireAuth();

  const params = await searchParams;

  // Get quarter data for selector
  const { currentQuarter, quarters } = await getCurrentYearQuarters();

  // Use selected quarter from URL or default to current quarter
  const selectedQuarter = params.quarter || currentQuarter;

  // Fetch data for selected quarter
  const fuelReportSummaries = await getFuelReportSummariesFromDB(
    selectedQuarter
  );

  const handleQuarterChange = async (quarter: string) => {
    "use server";
    // Redirect to update URL with selected quarter
    redirect(`/fuel-report?quarter=${quarter}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Quarter Selector */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Fuel Reports
              </h1>
              <p className="text-muted-foreground">
                View and manage fuel report summaries for {selectedQuarter}
              </p>
            </div>
            <QuarterSelector
              currentQuarter={selectedQuarter}
              quarters={quarters}
              onQuarterChange={handleQuarterChange}
            />
          </div>

          {/* Data Table */}
          <FuelReportsList fuelReportSummaries={fuelReportSummaries} />
        </div>
      </main>
    </div>
  );
}
