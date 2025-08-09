import { NextRequest, NextResponse } from "next/server";
import { processTransactionCSVData } from "@/lib/db/services/transaction-service";
import { Expense_CSV_Row } from "@/lib/types";

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
    const transactionData: Expense_CSV_Row[] = transactions;
    if (transactionData.length === 0) {
      return NextResponse.json(
        { error: "No transaction data provided" },
        { status: 400 }
      );
    }

    // Process the data
    const result = await processTransactionCSVData(transactionData);

    // Return success response with details
    return NextResponse.json({
      success: true,
      message: `Successfully processed ${result.transactionsCreated} transactions`,
      details: {
        transactionsCreated: result.transactionsCreated,
        duplicatesSkipped: result.duplicatesSkipped,
        nonDriversSkipped: result.nonDriversSkipped,
        errors: result.errors,
      },
    });
  } catch (error) {
    console.error("Error processing transactions:", error);
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
    // TODO: Implement GET endpoint to retrieve transactions
    // This could return paginated transactions, summary data, etc.
    return NextResponse.json({
      message: "Transactions API endpoint",
      endpoints: {
        POST: "Upload and process expense transaction CSV data",
        GET: "Retrieve transactions (coming soon)",
      },
    });
  } catch (error) {
    console.error("Error in transactions GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
