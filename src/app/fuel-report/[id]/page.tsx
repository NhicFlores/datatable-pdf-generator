import { getFuelReportDetailFromDB } from "@/lib/db/data-fetchers";
import { FuelReportDetail } from "@/components/state-manager/fuel-report-detail";
import { notFound } from "next/navigation";
import { requireAuth } from "@/auth";
import Header from "@/components/header";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Server Component - pre-fetches complete fuel report data with single optimized query
export default async function FuelReportDetailPage({ params }: PageProps) {
  // Ensure user is authenticated
  await requireAuth();

  const { id } = await params;

  // Single consolidated data fetch instead of parallel separate queries
  const { driverLogs, driverTransactions } = await getFuelReportDetailFromDB(
    id
  );

  if (!driverLogs) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <FuelReportDetail
          driverLogs={driverLogs}
          driverTransactions={driverTransactions}
        />
      </main>
    </div>
  );
}
