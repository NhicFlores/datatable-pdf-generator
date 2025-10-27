import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/auth";
import { getAllFuelLogsForQuarter } from "@/lib/db/data-fetchers";
import { getQuarterDateRange } from "@/lib/utils/quarter-utils";

/**
 * API endpoint to export all fuel logs for a specific quarter
 * GET /api/fuel-logs/export?quarter=2024-Q3
 */
export async function GET(request: NextRequest) {
  try {
    // Ensure user is authenticated
    await requireAuth();

    console.log("📥 Fuel logs export request received");

    // Get quarter parameter from URL
    const { searchParams } = new URL(request.url);
    const quarter = searchParams.get("quarter");

    if (!quarter) {
      return NextResponse.json(
        {
          success: false,
          error: "Quarter parameter is required. Format: YYYY-QN (e.g., 2024-Q3)",
        },
        { status: 400 }
      );
    }

    // Validate quarter format
    const quarterMatch = quarter.match(/^(\d{4})-Q([1-4])$/);
    if (!quarterMatch) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid quarter format. Expected format: YYYY-QN (e.g., 2024-Q3)",
        },
        { status: 400 }
      );
    }

    console.log(`📅 Fetching fuel logs for quarter: ${quarter}`);

    // Get date range for the quarter
    const dateRange = await getQuarterDateRange(quarter);
    if (!dateRange) {
      return NextResponse.json(
        {
          success: false,
          error: `Unable to determine date range for quarter: ${quarter}`,
        },
        { status: 400 }
      );
    }

    console.log(
      `📊 Date range: ${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`
    );

    // Fetch all fuel logs for the quarter
    const fuelLogs = await getAllFuelLogsForQuarter(dateRange);

    console.log(`✅ Retrieved ${fuelLogs.length} fuel log records for ${quarter}`);

    return NextResponse.json({
      success: true,
      quarter,
      dateRange: {
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      },
      count: fuelLogs.length,
      fuelLogs,
    });

  } catch (error) {
    console.error("💥 API route error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "Method not allowed. Use GET to export fuel logs.",
    },
    { status: 405 }
  );
}