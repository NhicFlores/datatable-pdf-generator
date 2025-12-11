import { getFuelReportDetailFromDB } from "@/lib/db/data-fetchers";
import { FuelReportDetail } from "@/components/state-manager/fuel-report-detail";
import { notFound } from "next/navigation";
import { requireAuth } from "@/auth";
import Header from "@/components/header";
import { getCurrentYearQuarters } from "@/lib/actions/quarter-data-actions";
import { getQuarterDateRangeFromQuarters } from "@/lib/utils/quarter-utils";
import { UserRoles } from "@/lib/data-model/enum-types";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ quarter?: string }>;
}

// Server Component - pre-fetches complete fuel report data with single optimized query
export default async function FuelReportDetailPage({
  params,
  searchParams,
}: PageProps) {
  // Ensure user is authenticated and get user data
  const user = await requireAuth();

  const { id } = await params;
  const urlParams = await searchParams;

  // Get quarter from URL params (passed from fuel reports list page)
  const selectedQuarter = urlParams.quarter;

  // Get quarter data and convert to date range if quarter is provided
  let selectedDateRange = null;
  if (selectedQuarter) {
    const { quarters } = await getCurrentYearQuarters();
    selectedDateRange = getQuarterDateRangeFromQuarters(
      selectedQuarter,
      quarters
    );
  }

  // Single consolidated data fetch with optional quarter filtering and branch isolation
  const { driverLogs, driverTransactions } = await getFuelReportDetailFromDB(
    id,
    selectedDateRange,
    // Only pass branch filter for non-admin users
    user.role === UserRoles.ADMIN ? undefined : user.branch
  );

  if (!driverLogs) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        {/* Quarter indicator
        {selectedQuarter && (
          <div className="mb-4">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Viewing data for {selectedQuarter}
            </div>
          </div>
        )} */}

        <FuelReportDetail
          driverLogs={driverLogs}
          driverTransactions={driverTransactions}
          quarterStartDate={selectedDateRange?.startDate}
          quarterEndDate={selectedDateRange?.endDate}
        />
      </main>
    </div>
  );
}
