export const revalidate = 60;
import { getFuelReportSummariesFromDB } from "@/lib/db/data-fetchers";
import { FuelReportsList } from "@/components/state-manager/fuel-reports-list";
import { requireAuth } from "@/lib/auth";
import Header from "@/components/header";

// Server Component - fetches fuel report summaries
export default async function FuelReportsPage() {
  // Ensure user is authenticated
  const user = await requireAuth();

  const fuelReportSummaries = await getFuelReportSummariesFromDB();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Fuel Reports</h2>
          <p className="text-gray-600 mt-1">
            Welcome back, {user.name}! Manage and review fuel transaction
            reports.
          </p>
        </div>
        <FuelReportsList fuelReportSummaries={fuelReportSummaries} />
      </main>
    </div>
  );
}
