import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { processTransactionCSVData } from "@/lib/db/services/transaction-service";
import { TransactionUploadRequestSchema } from "@/lib/validations/transaction";
import { FuelReportRoute } from "@/lib/routes";

/**
 * Modern API route with Zod validation and better error handling
 */
export async function POST(request: NextRequest) {
  try {
    console.log("📥 Transaction upload request received");

    // Parse and validate request body with Zod
    const body = await request.json();
    const validation = TransactionUploadRequestSchema.safeParse(body);

    if (!validation.success) {
      const errorMessages = validation.error.issues
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");

      console.error("❌ Request validation failed:", errorMessages);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request format",
          details: errorMessages,
        },
        { status: 400 }
      );
    }

    // Process the validated data
    const result = await processTransactionCSVData(
      validation.data.transactions
    );

    // Revalidate the fuel reports page to update driver count
    revalidatePath(FuelReportRoute.page);

    // Determine response status based on results
    const hasErrors =
      result.validationErrors.length > 0 || result.databaseErrors.length > 0;
    const statusCode = hasErrors ? 207 : 200; // 207 Multi-Status for partial success

    console.log(
      `✅ Processing complete: ${result.transactionsCreated} created, ${
        result.duplicatesSkipped + result.nonDriversSkipped
      } skipped`
    );

    return NextResponse.json(
      {
        success: result.transactionsCreated > 0,
        message:
          result.transactionsCreated > 0
            ? `Successfully processed ${result.transactionsCreated} transactions`
            : "No transactions were processed",
        data: {
          transactionsCreated: result.transactionsCreated,
          driversCreated: result.driversCreated,
          duplicatesSkipped: result.duplicatesSkipped,
          nonDriversSkipped: result.nonDriversSkipped,
          totalErrors:
            result.validationErrors.length + result.databaseErrors.length,
          validationErrors: result.validationErrors,
          databaseErrors: result.databaseErrors,
        },
      },
      { status: statusCode }
    );
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

export async function GET() {
  return NextResponse.json({
    message: "Modern Transactions API",
    endpoints: {
      POST: "Upload and process expense transaction CSV data with Zod validation",
      GET: "API information (this endpoint)",
    },
    features: [
      "Zod schema validation",
      "Database transactions",
      "Enhanced error handling",
      "Driver validation",
      "Duplicate detection",
    ],
  });
}
