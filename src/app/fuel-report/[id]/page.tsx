import { getFuelReportDetailFromDB } from "@/lib/db/data-fetchers";
import { FuelReportDetail } from "@/components/state-manager/fuel-report-detail";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Server Component - pre-fetches complete fuel report data with single optimized query
export default async function FuelReportDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Single consolidated data fetch instead of parallel separate queries
  const { fuelReport, driverTransactions } = await getFuelReportDetailFromDB(
    id
  );

  if (!fuelReport) {
    notFound();
  }

  return (
    <FuelReportDetail
      fuelReport={fuelReport}
      driverTransactions={driverTransactions}
    />
  );
}
