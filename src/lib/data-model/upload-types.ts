// Client-safe types shared by the upload API routes and the results modal.
// Must not import anything server-only.

export type UploadErrorStage =
  | "validation" // request/schema validation, before touching the database
  | "driver" // creating/looking up a driver
  | "insert" // processing or inserting a single row
  | "transaction"; // the outer transaction failed (nothing was saved)

export interface UploadRowError {
  stage: UploadErrorStage;
  /** 1-based position of the row in the uploaded data (excluding the header) */
  rowNumber?: number;
  /** Human-readable row identifier, e.g. "vehicle DEN-1579, invoice 123" */
  label?: string;
  field?: string;
  /** PostgreSQL SQLSTATE code, when the error came from the database */
  code?: string;
  message: string;
}

export interface FuelUploadSummary {
  created: number;
  driversCreated: number;
  duplicatesSkipped: number;
  failedRows: number;
  totalErrors: number;
}

export interface FuelUploadResponse {
  success: boolean;
  /** Correlates this response with the server logs */
  requestId: string;
  message?: string;
  error?: string;
  summary?: FuelUploadSummary;
  errors: UploadRowError[];
  insertedIds: string[];
}

export function countFailedRows(errors: UploadRowError[]): number {
  return new Set(
    errors.map((e) => e.rowNumber).filter((n): n is number => n !== undefined)
  ).size;
}

export function formatUploadError(error: UploadRowError): string {
  const where = error.rowNumber
    ? `Row ${error.rowNumber}${error.label ? ` (${error.label})` : ""}: `
    : error.label
    ? `${error.label}: `
    : "";
  const field = error.field ? `${error.field} ` : "";
  return `${where}${field}${error.message}`;
}
