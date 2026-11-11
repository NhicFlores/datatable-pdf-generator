export interface DbErrorInfo {
  /** PostgreSQL SQLSTATE code (e.g. "22003"), if one could be found */
  code?: string;
  /** Raw message from the root error, with any SQL / bound params stripped */
  message: string;
  detail?: string;
  constraint?: string;
  column?: string;
  table?: string;
  schema?: string;
  dataType?: string;
}

interface PgLikeError {
  code?: unknown;
  detail?: unknown;
  constraint?: unknown;
  column?: unknown;
  table?: unknown;
  schema?: unknown;
  dataType?: unknown;
}

const SQLSTATE_PATTERN = /^[0-9A-Z]{5}$/;
const MAX_CAUSE_DEPTH = 10;

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

// DrizzleQueryError.message is "Failed query: <sql> params: <values>", which can
// leak row data. The useful Postgres error lives on `.cause`.
function isDrizzleQueryError(error: Error): boolean {
  return (
    "query" in error &&
    "params" in error &&
    error.message.startsWith("Failed query:")
  );
}

/**
 * Walks the `cause` chain and returns the underlying PostgreSQL error details.
 * Never includes the SQL text or bound parameters.
 */
export function extractDbError(error: unknown): DbErrorInfo {
  const chain: Error[] = [];
  let current: unknown = error;
  while (
    current instanceof Error &&
    chain.length < MAX_CAUSE_DEPTH &&
    !chain.includes(current)
  ) {
    chain.push(current);
    current = current.cause;
  }

  if (chain.length === 0) {
    return { message: typeof error === "string" ? error : "Unknown error" };
  }

  const pgError =
    chain.find((e) => SQLSTATE_PATTERN.test(asString((e as PgLikeError).code) ?? "")) ??
    undefined;

  if (pgError) {
    const pg = pgError as Error & PgLikeError;
    return {
      code: asString(pg.code),
      message: pg.message,
      detail: asString(pg.detail),
      constraint: asString(pg.constraint),
      column: asString(pg.column),
      table: asString(pg.table),
      schema: asString(pg.schema),
      dataType: asString(pg.dataType),
    };
  }

  // No Postgres error found (e.g. network / pool failure): use the deepest
  // error that isn't a query wrapper.
  const root = [...chain].reverse().find((e) => !isDrizzleQueryError(e));
  return {
    message: root ? root.message : "Query failed (no further details available)",
  };
}

const FRIENDLY_MESSAGES: Record<string, string> = {
  "22003": "A numeric value is outside the range allowed by its column",
  "22001": "A text value is longer than its column allows",
  "22007": "A date/time value has an invalid format",
  "22P02": "A value has an invalid format for its column type",
  "23502": "A required value is missing (NOT NULL violation)",
  "23503": "Referenced record does not exist (foreign key violation)",
  "23505": "Duplicate record (unique constraint violation)",
  "23514": "A value failed a check constraint",
  "25P02":
    "Skipped because an earlier statement in the same transaction failed",
  "40001": "Transaction conflict, please retry",
  "40P01": "Deadlock detected, please retry",
  "42501": "Database permission denied",
  "42703": "A column does not exist (database schema may be out of date)",
  "42P01": "A table does not exist (database schema may be out of date)",
  "53300": "Database has too many connections",
  "57014": "Query was cancelled (timeout)",
};

/**
 * Builds a concise, user-facing message for a database error. Contains the
 * SQLSTATE code and the constraint/column/detail when Postgres provides them.
 */
export function toUserMessage(info: DbErrorInfo): string {
  const summary =
    (info.code && FRIENDLY_MESSAGES[info.code]) || info.message;

  const parts: string[] = [];
  if (info.column) parts.push(`column: ${info.column}`);
  if (info.constraint) parts.push(`constraint: ${info.constraint}`);
  if (info.detail) parts.push(info.detail);
  // Surface Postgres' own message when we substituted a friendlier summary
  if (info.code && FRIENDLY_MESSAGES[info.code] && info.message) {
    parts.push(info.message);
  }

  const code = info.code ? ` [${info.code}]` : "";
  return parts.length > 0
    ? `${summary}${code} (${parts.join("; ")})`
    : `${summary}${code}`;
}
