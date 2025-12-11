export const revalidate = 60;
import { getFuelReportSummariesFromDB } from "@/lib/db/data-fetchers";
import { FuelReportsList } from "@/components/state-manager/fuel-reports-list";
import { requireAuth } from "@/auth";
import Header from "@/components/header";
import { getCurrentYearQuarters } from "@/lib/actions/quarter-data-actions";
import { getQuarterDateRangeFromQuarters } from "@/lib/utils/quarter-utils";
import { QuarterSelector } from "@/components/quarter-selector";
import { redirect } from "next/navigation";
import { UserRoles } from "@/lib/data-model/enum-types";

interface PageProps {
  searchParams: Promise<{ quarter?: string }>;
}

// Server Component - fetches fuel report summaries
export default async function FuelReportsPage({ searchParams }: PageProps) {
  // Ensure user is authenticated and get user data
  const user = await requireAuth();

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

  // Fetch data for selected quarter with branch filtering
  const fuelReportSummaries = await getFuelReportSummariesFromDB(
    selectedDateRange,
    // Only pass branch filter for non-admin users
    user.role === UserRoles.ADMIN ? undefined : user.branch
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
                {user.role !== UserRoles.ADMIN && ` - ${user.branch} Branch`}
              </p>
            </div>
            <QuarterSelector
              currentQuarter={selectedQuarter}
              quarters={quarters}
              onQuarterChange={handleQuarterChange}
            />
          </div>

          {/* Data Table */}
          <FuelReportsList
            fuelReportSummaries={fuelReportSummaries}
            selectedQuarter={selectedQuarter}
          />
        </div>
      </main>
    </div>
  );
}
