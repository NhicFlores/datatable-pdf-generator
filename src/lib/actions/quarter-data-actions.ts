"use server";

import { getQuarterSettings } from "./quarter-settings-actions";

export interface QuarterOption {
  value: string;
  label: string;
  quarter: number;
  startDate: Date;
  endDate: Date;
}

export async function getCurrentYearQuarters(): Promise<{
  currentQuarter: string;
  quarters: QuarterOption[];
}> {
  try {
    const currentYear = new Date().getFullYear();
    const today = new Date();

    // Get quarter settings for current year
    const quarterSettings = await getQuarterSettings(currentYear);

    // Transform to dropdown options
    const quarters: QuarterOption[] = quarterSettings.quarters.map((q) => ({
      value: `${currentYear}-Q${q.quarter}`,
      label: `Q${
        q.quarter
      } ${currentYear} (${q.startDate.toLocaleDateString()} - ${q.endDate.toLocaleDateString()})`,
      quarter: q.quarter,
      startDate: q.startDate,
      endDate: q.endDate,
    }));

    // Determine current quarter based on today's date
    const currentQuarterData = quarterSettings.quarters.find(
      (q) => today >= q.startDate && today <= q.endDate
    );

    const currentQuarter = currentQuarterData
      ? `${currentYear}-Q${currentQuarterData.quarter}`
      : `${currentYear}-Q1`; // Default to Q1 if no match

    return {
      currentQuarter,
      quarters,
    };
  } catch (error) {
    console.error("Error fetching quarter data:", error);

    // Return fallback data if quarter settings fail
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentQuarterNum = Math.floor(currentMonth / 3) + 1;

    const fallbackQuarters: QuarterOption[] = Array.from(
      { length: 4 },
      (_, i) => {
        const quarter = i + 1;
        const startMonth = (quarter - 1) * 3;
        const endMonth = startMonth + 2;
        const startDate = new Date(currentYear, startMonth, 1);
        const endDate = new Date(currentYear, endMonth + 1, 0);

        return {
          value: `${currentYear}-Q${quarter}`,
          label: `Q${quarter} ${currentYear} (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`,
          quarter,
          startDate,
          endDate,
        };
      }
    );

    return {
      currentQuarter: `${currentYear}-Q${currentQuarterNum}`,
      quarters: fallbackQuarters,
    };
  }
}

export async function fetchQuarterData(quarter: string) {
  "use server";

  console.log(`Fetching data for quarter: ${quarter}`);

  // For now, we'll use revalidatePath to refresh the page data
  // This will cause the page to re-run and fetch data with the new quarter
  const { revalidatePath } = await import("next/cache");

  // Revalidate the fuel reports page to fetch new data
  revalidatePath("/fuel-report");

  return { success: true, quarter };
}
