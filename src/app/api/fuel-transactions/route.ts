import { NextRequest, NextResponse } from "next/server";
import { FuelCSVRow, FuelCSVRowSchema } from "@/lib/validations/fuel";
import { processFuelCSVData } from "@/lib/db/services/fuel-service";

export async function POST(request: NextRequest) {
  try {
    console.log("📥 Fuel transaction upload request received");

    const body = await request.json();
    const { transactions } = body;

    // Validate request body
    if (!transactions || !Array.isArray(transactions)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body. Expected 'transactions' array.",
        },
        { status: 400 }
      );
    }

    if (transactions.length === 0) {
      return NextResponse.json(
        { success: false, error: "No transaction data provided" },
        { status: 400 }
      );
    }

    // Zod validation for each row
    const validationResults = transactions.map(
      (row: FuelCSVRow, idx: number) => {
        const result = FuelCSVRowSchema.safeParse(row);
        return { idx, result };
      }
    );

    const errors = validationResults
      .filter((r) => !r.result.success)
      .map(
        (r) =>
          `Row ${r.idx + 1}: ${r.result.error?.issues
            .map((i) => i.message)
            .join(", ")}`
      );

    const validRows = validationResults
      .filter((r) => r.result.success)
      .map((r) => r.result.data!);

    console.log(
      `🔍 Validation complete: ${validRows.length} valid, ${errors.length} errors`
    );

    if (validRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid transactions to process",
          errors,
        },
        { status: 400 }
      );
    }

    // Process valid rows with database transaction
    const result = await processFuelCSVData(validRows);

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${result.transactionsCreated} fuel transactions`,
      details: {
        driversCreated: result.driversCreated,
        transactionsCreated: result.transactionsCreated,
        insertedIds: result.insertedIds,
        validationErrors: errors,
        databaseErrors: result.errors,
      },
    });
  } catch (error) {
    console.error("💥 Error processing fuel transactions:", error);
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
