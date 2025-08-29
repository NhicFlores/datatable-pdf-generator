import { NextRequest, NextResponse } from "next/server";
import {
  findMatchesForDriver,
  getActiveMatchesForDriver,
} from "@/lib/db/services/matching-service";

/**
 * API endpoint for manual matching operations
 * POST /api/matching
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, driverId, transactionId, fuelLogId } = body;

    switch (action) {
      case "find_matches":
        // Trigger manual matching for a driver
        if (!driverId) {
          return NextResponse.json(
            {
              success: false,
              error: "Driver ID is required for find_matches action",
            },
            { status: 400 }
          );
        }

        const matches = await findMatchesForDriver(driverId);
        return NextResponse.json({
          success: true,
          message: `Found ${matches.length} matches for driver`,
          data: { matches },
        });

      case "get_matches":
        // Get current matches for a driver
        if (!driverId) {
          return NextResponse.json(
            {
              success: false,
              error: "Driver ID is required for get_matches action",
            },
            { status: 400 }
          );
        }

        const activeMatches = await getActiveMatchesForDriver(driverId);
        return NextResponse.json({
          success: true,
          data: activeMatches,
        });

      case "manual_match":
        // Create a manual match
        if (!transactionId || !fuelLogId) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Transaction ID and Fuel Log ID are required for manual_match action",
            },
            { status: 400 }
          );
        }

        // For now, we'll add this as a future enhancement
        return NextResponse.json(
          { success: false, error: "Manual matching not yet implemented" },
          { status: 501 }
        );

      default:
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid action. Supported actions: find_matches, get_matches, manual_match",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("❌ Matching API error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to retrieve matching statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get("driverId");

    if (!driverId) {
      return NextResponse.json(
        { success: false, error: "Driver ID is required" },
        { status: 400 }
      );
    }

    const activeMatches = await getActiveMatchesForDriver(driverId);

    return NextResponse.json({
      success: true,
      data: {
        totalMatches: activeMatches.matches.length,
        matchedTransactions: activeMatches.matchedTransactionIds.size,
        matchedFuelLogs: activeMatches.matchedFuelLogIds.size,
        averageConfidence:
          activeMatches.matches.length > 0
            ? activeMatches.matches.reduce(
                (sum: number, m) => sum + m.confidence,
                0
              ) / activeMatches.matches.length
            : 0,
        matchTypeBreakdown: activeMatches.matches.reduce(
          (acc: Record<string, number>, match) => {
            acc[match.matchType] = (acc[match.matchType] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
      },
    });
  } catch (error) {
    console.error("❌ Matching statistics error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
