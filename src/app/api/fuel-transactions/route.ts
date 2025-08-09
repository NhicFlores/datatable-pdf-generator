import { NextRequest, NextResponse } from "next/server";
import { processFuelCSVData } from "@/lib/db/services/fuel-service";
import { Fuel_CSV_Row } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactions } = body;

    // Validate request body
    if (!transactions || !Array.isArray(transactions)) {
      return NextResponse.json(
        { error: "Invalid request body. Expected 'transactions' array." },
        { status: 400 }
      );
    }

    // Validate data structure
    const fuelData: Fuel_CSV_Row[] = transactions;
    if (fuelData.length === 0) {
      return NextResponse.json(
        { error: "No transaction data provided" },
        { status: 400 }
      );
    }

    // Process the data
    const result = await processFuelCSVData(fuelData);

    // Return success response with details
    return NextResponse.json({
      success: true,
      message: `Successfully processed ${result.transactionsCreated} fuel transactions`,
      details: {
        driversCreated: result.driversCreated,
        transactionsCreated: result.transactionsCreated,
        errors: result.errors,
      },
    });
  } catch (error) {
    console.error("Error processing fuel transactions:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // TODO: Implement GET endpoint to retrieve fuel transactions
    // This could return paginated fuel transactions, summary data, etc.
    return NextResponse.json({
      message: "Fuel transactions API endpoint",
      endpoints: {
        POST: "Upload and process fuel transaction CSV data",
        GET: "Retrieve fuel transactions (coming soon)",
      },
    });
  } catch (error) {
    console.error("Error in fuel transactions GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
