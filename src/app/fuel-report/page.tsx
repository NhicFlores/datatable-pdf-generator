export const revalidate = 60;
import { getFuelReportSummariesFromDB } from "@/lib/db/data-fetchers";
import { FuelReportsList } from "@/components/state-manager/fuel-reports-list";

// Server Component - fetches fuel report summaries
export default async function FuelReportsPage() {
  const fuelReportSummaries = await getFuelReportSummariesFromDB();

  return <FuelReportsList fuelReportSummaries={fuelReportSummaries} />;
}
