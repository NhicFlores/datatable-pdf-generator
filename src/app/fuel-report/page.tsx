export const revalidate = 60;
import { getFuelReportSummariesFromDB } from "@/lib/db/data-fetchers";
import { FuelReportsList } from "@/components/state-manager/fuel-reports-list";
import { requireAuth } from "@/auth";
import Header from "@/components/header";

// Server Component - fetches fuel report summaries
export default async function FuelReportsPage() {
  // Ensure user is authenticated
  await requireAuth();

  const fuelReportSummaries = await getFuelReportSummariesFromDB();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <FuelReportsList fuelReportSummaries={fuelReportSummaries} />
      </main>
    </div>
  );
}
