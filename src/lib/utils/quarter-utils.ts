import { getQuarterSettings } from "@/lib/actions/quarter-settings-actions";
import type { QuarterOption } from "@/lib/actions/quarter-data-actions";

export interface QuarterDateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Parse quarter string (e.g., "2024-Q3") and return date range
 */
export async function getQuarterDateRange(
  quarterString: string
): Promise<QuarterDateRange | null> {
  try {
    // Parse quarter string format: "YYYY-QN"
    const match = quarterString.match(/^(\d{4})-Q(\d)$/);
    if (!match) {
      console.error("Invalid quarter format:", quarterString);
      return null;
    }

    const year = parseInt(match[1]);
    const quarter = parseInt(match[2]);

    if (quarter < 1 || quarter > 4) {
      console.error("Invalid quarter number:", quarter);
      return null;
    }

    // Get quarter settings for the year
    const quarterSettings = await getQuarterSettings(year);

    // Find the specific quarter
    const quarterData = quarterSettings.quarters.find(
      (q) => q.quarter === quarter
    );

    if (!quarterData) {
      console.error("Quarter data not found:", quarterString);
      return null;
    }

    return {
      startDate: quarterData.startDate,
      endDate: quarterData.endDate,
    };
  } catch (error) {
    console.error("Error getting quarter date range:", error);
    return null;
  }
}

/**
 * Get current quarter in string format (e.g., "2024-Q3")
 */
export function getCurrentQuarterString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-based
  const quarter = Math.floor(month / 3) + 1;
  return `${year}-Q${quarter}`;
}

/**
 * Get date range for a quarter from the quarters array (avoids re-fetching quarter settings)
 * This is a pure utility function that doesn't need to be a server action
 */
export function getQuarterDateRangeFromQuarters(
  quarterString: string,
  quarters: QuarterOption[]
): QuarterDateRange | null {
  const quarter = quarters.find((q) => q.value === quarterString);
  return quarter
    ? { startDate: quarter.startDate, endDate: quarter.endDate }
    : null;
}
