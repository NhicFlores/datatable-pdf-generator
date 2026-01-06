"use server";

import { getQuarterSettings, getCurrentQuarterFromDB } from "./quarter-settings-actions";

export interface QuarterOption {
  value: string;
  label: string;
  quarter: number;
  startDate: Date;
  endDate: Date;
}

export interface QuarterDateRange {
  startDate: Date;
  endDate: Date;
}

export async function getCurrentYearQuarters(): Promise<{
  currentQuarter: string;
  currentQuarterDateRange: QuarterDateRange | null;
  quarters: QuarterOption[];
}> {
  try {
    const currentYear = new Date().getFullYear();

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

    // Get the current quarter from database (based on isCurrent flag)
    const { currentQuarter, currentQuarterDateRange } = await getCurrentQuarterFromDB();

    return {
      currentQuarter,
      currentQuarterDateRange,
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

    // Get the date range for the current quarter from fallback data
    const currentQuarterFallback = fallbackQuarters.find(
      (q) => q.quarter === currentQuarterNum
    );
    const currentQuarterDateRange = currentQuarterFallback
      ? {
          startDate: currentQuarterFallback.startDate,
          endDate: currentQuarterFallback.endDate,
        }
      : null;

    return {
      currentQuarter: `${currentYear}-Q${currentQuarterNum}`,
      currentQuarterDateRange,
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
