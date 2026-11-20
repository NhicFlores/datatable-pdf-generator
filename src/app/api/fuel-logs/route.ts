import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { FuelCSVRowSchema, type FuelCSVRow } from "@/lib/validations/fuel";
import { processFuelCSVData } from "@/lib/db/services/fuel-service";
import {
  countFailedRows,
  type FuelUploadResponse,
  type UploadRowError,
} from "@/lib/data-model/upload-types";

const emptyResponse = (requestId: string): FuelUploadResponse => ({
  success: false,
  requestId,
  errors: [],
  insertedIds: [],
});

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  try {
    console.log(`📥 [${requestId}] Fuel transaction upload request received`);

    const body = await request.json();
    const { transactions } = body;

    // Validate request body
    if (!transactions || !Array.isArray(transactions)) {
      return NextResponse.json(
        {
          ...emptyResponse(requestId),
          error: "Invalid request body. Expected 'transactions' array.",
        },
        { status: 400 }
      );
    }

    if (transactions.length === 0) {
      return NextResponse.json(
        { ...emptyResponse(requestId), error: "No transaction data provided" },
        { status: 400 }
      );
    }

    // Zod validation for each row. Keep each valid row's original position so
    // later errors point at the right row in the uploaded file.
    const validationErrors: UploadRowError[] = [];
    const validRows: FuelCSVRow[] = [];
    const validRowNumbers: number[] = [];

    transactions.forEach((row: unknown, idx: number) => {
      const parsed = FuelCSVRowSchema.safeParse(row);
      if (parsed.success) {
        validRows.push(parsed.data);
        validRowNumbers.push(idx + 1);
        return;
      }
      const raw = (row ?? {}) as Record<string, unknown>;
      const label =
        typeof raw.vehicleId === "string" && raw.vehicleId
          ? `vehicle ${raw.vehicleId}${
              typeof raw.invoiceNumber === "string" && raw.invoiceNumber
                ? `, invoice ${raw.invoiceNumber}`
                : ""
            }`
          : undefined;
      for (const issue of parsed.error.issues) {
        validationErrors.push({
          stage: "validation",
          rowNumber: idx + 1,
          label,
          field: issue.path.join(".") || undefined,
          message: issue.message,
        });
      }
    });

    console.log(
      `🔍 [${requestId}] Validation complete: ${validRows.length} valid, ${countFailedRows(validationErrors)} invalid rows`
    );

    if (validRows.length === 0) {
      return NextResponse.json(
        {
          ...emptyResponse(requestId),
          error: "No valid transactions to process",
          summary: {
            created: 0,
            driversCreated: 0,
            duplicatesSkipped: 0,
            failedRows: countFailedRows(validationErrors),
            totalErrors: validationErrors.length,
          },
          errors: validationErrors,
        } satisfies FuelUploadResponse,
        { status: 400 }
      );
    }

    // Process valid rows with database transaction
    const result = await processFuelCSVData(validRows, {
      rowNumbers: validRowNumbers,
      requestId,
    });
    const errors = [...validationErrors, ...result.errors];
    const summary = {
      created: result.transactionsCreated,
      driversCreated: result.driversCreated,
      duplicatesSkipped: result.skippedDuplicates,
      failedRows: countFailedRows(errors),
      totalErrors: errors.length,
    };

    // The outer transaction failed/rolled back: nothing was saved
    if (!result.committed) {
      return NextResponse.json(
        {
          success: false,
          requestId,
          error: result.errors[result.errors.length - 1]?.message ??
            "Database transaction failed",
          summary,
          errors,
          insertedIds: [],
        } satisfies FuelUploadResponse,
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      requestId,
      message: `Successfully processed ${result.transactionsCreated} fuel transactions`,
      summary,
      errors,
      insertedIds: result.insertedIds,
    } satisfies FuelUploadResponse);
  } catch (error) {
    console.error(`💥 [${requestId}] Error processing fuel transactions:`, error);
    return NextResponse.json(
      {
        ...emptyResponse(requestId),
        error: "Internal server error",
        errors: [
          {
            stage: "transaction",
            message:
              error instanceof Error ? error.message : "Unknown error",
          },
        ],
      } satisfies FuelUploadResponse,
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
