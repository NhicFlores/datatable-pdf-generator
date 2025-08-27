import {
  getFuelReportByIdFromDB,
  getTransactionsByDriverFromDB,
} from "@/lib/db/data-fetchers";
import { FuelReportDetail } from "@/components/state-manager/fuel-report-detail";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Server Component - pre-fetches fuel report detail data and matching transactions
export default async function FuelReportDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch both fuel report and matching transactions in parallel
  const [fuelReport, driverTransactions] = await Promise.all([
    getFuelReportByIdFromDB(id),
    getTransactionsByDriverFromDB(id),
  ]);

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
