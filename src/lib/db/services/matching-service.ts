import { db, schema, eq, and } from "@/lib/db";
import {
  SelectTransaction,
  SelectFuelLog,
  InsertTransactionFuelMatch,
} from "@/lib/data-model/schema-types";
import { MatchSummary } from "@/lib/data-model/query-types";

export interface MatchingResult {
  transactionId: string;
  fuelLogId: string;
  matchType: "date_cost" | "date_quantity" | "date_supplier_state";
  confidence: number;
}

// Type definition for matching functions
export type MatchingFunction = (
  transaction: SelectTransaction,
  fuelLogs: SelectFuelLog[]
) => MatchingResult[];

// =============================================================================
// PURE MATCHING FUNCTIONS
// =============================================================================

/**
 * Date + Cost matching (highest confidence)
 * Matches transactions that occur on the same date with costs within $0.01
 */
export const matchByDateAndCost: MatchingFunction = (transaction, fuelLogs) => {
  const results: MatchingResult[] = [];
  const transactionDate = new Date(transaction.transactionDate).toDateString();
  const transactionCost = parseFloat(transaction.billingAmount);

  for (const fuelLog of fuelLogs) {
    const fuelLogDate = new Date(fuelLog.date).toDateString();
    const fuelLogCost = parseFloat(fuelLog.cost);

    // Check if dates match and costs are within $0.01
    if (
      transactionDate === fuelLogDate &&
      Math.abs(transactionCost - fuelLogCost) < 0.01
    ) {
      results.push({
        transactionId: transaction.id,
        fuelLogId: fuelLog.id,
        matchType: "date_cost",
        confidence: 0.95, // High confidence for exact date + cost match
      });
    }
  }

  return results;
};

/**
 * Date + Fuel Quantity matching (high confidence)
 * Matches transactions that have fuel quantity data matching within 0.01 gallons
 */
export const matchByDateAndQuantity: MatchingFunction = (
  transaction,
  fuelLogs
) => {
  const results: MatchingResult[] = [];

  // Only proceed if transaction has fuel quantity data
  if (!transaction.fuelQuantity) {
    return results;
  }

  const transactionDate = new Date(transaction.transactionDate).toDateString();
  const transactionQuantity = parseFloat(transaction.fuelQuantity);

  for (const fuelLog of fuelLogs) {
    const fuelLogDate = new Date(fuelLog.date).toDateString();
    const fuelLogQuantity = parseFloat(fuelLog.gallons);

    // Check if dates match and quantities are within 0.01 gallons
    if (
      transactionDate === fuelLogDate &&
      Math.abs(transactionQuantity - fuelLogQuantity) < 0.01
    ) {
      results.push({
        transactionId: transaction.id,
        fuelLogId: fuelLog.id,
        matchType: "date_quantity",
        confidence: 0.9, // High confidence for exact date + quantity match
      });
    }
  }

  return results;
};

/**
 * Date + Supplier + State matching (medium confidence)
 * Matches based on date, partial supplier name match, and state
 */
export const matchByDateSupplierAndState: MatchingFunction = (
  transaction,
  fuelLogs
) => {
  const results: MatchingResult[] = [];

  if (!transaction.supplierName || !transaction.supplierState) {
    return results;
  }

  const transactionDate = new Date(transaction.transactionDate).toDateString();
  const transactionCost = parseFloat(transaction.billingAmount);

  for (const fuelLog of fuelLogs) {
    const fuelLogDate = new Date(fuelLog.date).toDateString();
    const fuelLogCost = parseFloat(fuelLog.cost);

    // Check date match first
    if (transactionDate !== fuelLogDate) {
      continue;
    }

    // Check supplier name partial match (case insensitive)
    const supplierMatch = supplierNamesMatch(
      transaction.supplierName,
      fuelLog.sellerName
    );

    // Check state match (handle abbreviations)
    const stateMatch = statesMatch(
      transaction.supplierState,
      fuelLog.sellerState
    );

    if (supplierMatch && stateMatch) {
      // Calculate confidence based on cost similarity (within 15% tolerance)
      const costDifference =
        Math.abs(transactionCost - fuelLogCost) / transactionCost;
      const confidence = costDifference <= 0.15 ? 0.8 : 0.7;

      results.push({
        transactionId: transaction.id,
        fuelLogId: fuelLog.id,
        matchType: "date_supplier_state",
        confidence,
      });
    }
  }

  return results;
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if supplier names match using fuzzy matching
 */
export const supplierNamesMatch = (
  supplierName: string,
  sellerName: string
): boolean => {
  // Convert to lowercase and remove common prefixes/suffixes
  const normalize = (name: string) =>
    name
      .toLowerCase()
      .replace(/\b(inc|corp|llc|co|company|ltd)\b/g, "")
      .replace(/[^a-z0-9]/g, "")
      .trim();

  const normalizedSupplier = normalize(supplierName);
  const normalizedSeller = normalize(sellerName);

  // Check if one contains the other or if they share significant overlap
  return (
    normalizedSupplier.includes(normalizedSeller) ||
    normalizedSeller.includes(normalizedSupplier) ||
    calculateStringSimilarity(normalizedSupplier, normalizedSeller) > 0.6
  );
};

/**
 * Check if states match (handles abbreviations vs full names)
 */
export const statesMatch = (state1: string, state2: string): boolean => {
  const stateAbbreviations: { [key: string]: string } = {
    alabama: "al",
    alaska: "ak",
    arizona: "az",
    arkansas: "ar",
    california: "ca",
    colorado: "co",
    connecticut: "ct",
    delaware: "de",
    florida: "fl",
    georgia: "ga",
    hawaii: "hi",
    idaho: "id",
    illinois: "il",
    indiana: "in",
    iowa: "ia",
    kansas: "ks",
    kentucky: "ky",
    louisiana: "la",
    maine: "me",
    maryland: "md",
    massachusetts: "ma",
    michigan: "mi",
    minnesota: "mn",
    mississippi: "ms",
    missouri: "mo",
    montana: "mt",
    nebraska: "ne",
    nevada: "nv",
    "new hampshire": "nh",
    "new jersey": "nj",
    "new mexico": "nm",
    "new york": "ny",
    "north carolina": "nc",
    "north dakota": "nd",
    ohio: "oh",
    oklahoma: "ok",
    oregon: "or",
    pennsylvania: "pa",
    "rhode island": "ri",
    "south carolina": "sc",
    "south dakota": "sd",
    tennessee: "tn",
    texas: "tx",
    utah: "ut",
    vermont: "vt",
    virginia: "va",
    washington: "wa",
    "west virginia": "wv",
    wisconsin: "wi",
    wyoming: "wy",
  };

  const normalize = (state: string) => state.toLowerCase().trim();
  const s1 = normalize(state1);
  const s2 = normalize(state2);

  // Direct match
  if (s1 === s2) return true;

  // Check abbreviation matches
  const abbrev1 = stateAbbreviations[s1] || s1;
  const abbrev2 = stateAbbreviations[s2] || s2;

  return abbrev1 === abbrev2;
};

/**
 * Calculate string similarity using Levenshtein distance
 */
export const calculateStringSimilarity = (
  str1: string,
  str2: string
): number => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

/**
 * Calculate Levenshtein distance between two strings
 */
export const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[j][i] = matrix[j - 1][i - 1];
      } else {
        matrix[j][i] = Math.min(
          matrix[j - 1][i - 1] + 1,
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
};

/**
 * Deduplicate matches, keeping the highest confidence for each transaction-fuel log pair
 */
export const deduplicateMatches = (
  matches: MatchingResult[]
): MatchingResult[] => {
  const matchMap = new Map<string, MatchingResult>();

  for (const match of matches) {
    const key = `${match.transactionId}-${match.fuelLogId}`;
    const existing = matchMap.get(key);

    // Keep the match with higher confidence
    if (!existing || match.confidence > existing.confidence) {
      matchMap.set(key, match);
    }
  }

  return Array.from(matchMap.values());
};

// =============================================================================
// MAIN MATCHING ORCHESTRATION FUNCTIONS
// =============================================================================

/**
 * All available matching functions in order of preference
 */
export const MATCHING_FUNCTIONS: MatchingFunction[] = [
  matchByDateAndCost,
  matchByDateAndQuantity,
  matchByDateSupplierAndState,
];

/**
 * Apply all matching strategies to find matches for a transaction
 */
export const findMatchesForTransaction = (
  transaction: SelectTransaction,
  fuelLogs: SelectFuelLog[]
): MatchingResult[] => {
  const allMatches: MatchingResult[] = [];

  // Apply each matching function
  for (const matchingFn of MATCHING_FUNCTIONS) {
    const matches = matchingFn(transaction, fuelLogs);
    allMatches.push(...matches);
  }

  return deduplicateMatches(allMatches);
};

/**
 * Find matches for multiple transactions
 */
export const findMatchesForTransactions = (
  transactions: SelectTransaction[],
  fuelLogs: SelectFuelLog[]
): MatchingResult[] => {
  const allMatches: MatchingResult[] = [];

  for (const transaction of transactions) {
    const matches = findMatchesForTransaction(transaction, fuelLogs);
    allMatches.push(...matches);
  }

  return allMatches;
};

// Database access functions
const getTransactionsByDriver = async (
  driverId: string
): Promise<SelectTransaction[]> => {
  // Get driver info first
  const driver = await db.query.drivers.findFirst({
    where: eq(schema.drivers.id, driverId),
  });

  if (!driver) {
    throw new Error(`Driver not found: ${driverId}`);
  }

  // Get transactions by driver name (since transactions table doesn't have driverId foreign key)
  return await db.query.transactions.findMany({
    where: eq(schema.transactions.cardholderName, driver.name),
  });
};

const getFuelLogsByDriver = async (
  driverId: string
): Promise<SelectFuelLog[]> => {
  return await db.query.fuelLogs.findMany({
    where: eq(schema.fuelLogs.driverId, driverId),
  });
};

// Utility functions
const deduplicateMatchingResults = (
  matches: MatchingResult[]
): MatchingResult[] => {
  const matchMap = new Map<string, MatchingResult>();

  for (const match of matches) {
    const key = `${match.transactionId}-${match.fuelLogId}`;
    const existing = matchMap.get(key);

    // Keep the match with higher confidence
    if (!existing || match.confidence > existing.confidence) {
      matchMap.set(key, match);
    }
  }

  return Array.from(matchMap.values());
};

const storeMatches = async (matches: MatchingResult[]): Promise<void> => {
  if (matches.length === 0) {
    return;
  }

  try {
    // Prepare insert data
    const matchInserts: InsertTransactionFuelMatch[] = matches.map((match) => ({
      transactionId: match.transactionId,
      fuelLogId: match.fuelLogId,
      matchType: match.matchType,
      confidence: match.confidence.toString(),
      isActive: true,
      createdBy: "system",
    }));

    // Insert matches (on conflict do nothing to avoid duplicates)
    await db
      .insert(schema.transactionFuelMatches)
      .values(matchInserts)
      .onConflictDoNothing();

    console.log(`✅ Stored ${matches.length} matches in database`);
  } catch (error) {
    console.error(`❌ Error storing matches:`, error);
    throw error;
  }
};

// Core orchestration functions
/**
 * Find matches for a specific driver using all available strategies
 */
export const findMatchesForDriver = async (
  driverId: string
): Promise<MatchSummary[]> => {
  try {
    console.log(`🔍 Finding matches for driver: ${driverId}`);

    // Get all transactions and fuel logs for the driver
    const [transactions, fuelLogs] = await Promise.all([
      getTransactionsByDriver(driverId),
      getFuelLogsByDriver(driverId),
    ]);

    console.log(
      `Found ${transactions.length} transactions and ${fuelLogs.length} fuel logs`
    );

    const allMatches: MatchingResult[] = [];

    // Apply each strategy to find matches
    for (const transaction of transactions) {
      const dateAndCostMatches = matchByDateAndCost(transaction, fuelLogs);
      const dateAndQuantityMatches = matchByDateAndQuantity(
        transaction,
        fuelLogs
      );
      const dateSupplierStateMatches = matchByDateSupplierAndState(
        transaction,
        fuelLogs
      );

      allMatches.push(
        ...dateAndCostMatches,
        ...dateAndQuantityMatches,
        ...dateSupplierStateMatches
      );
    }

    // Deduplicate and rank by confidence
    const deduplicatedMatches = deduplicateMatchingResults(allMatches);

    // Store matches in database
    await storeMatches(deduplicatedMatches);

    // Return match summaries
    return deduplicatedMatches.map((match) => ({
      transactionId: match.transactionId,
      fuelLogId: match.fuelLogId,
      matchType: match.matchType,
      confidence: match.confidence,
      isActive: true,
    }));
  } catch (error) {
    console.error(`❌ Error finding matches for driver ${driverId}:`, error);
    throw error;
  }
};

/**
 * Get all active matches for a driver (for UI display)
 */
export const getActiveMatchesForDriver = async (
  driverId: string
): Promise<{
  matchedTransactionIds: Set<string>;
  matchedFuelLogIds: Set<string>;
  matches: MatchSummary[];
}> => {
  try {
    // Get active matches with transaction and fuel log data
    const matches = await db
      .select({
        id: schema.transactionFuelMatches.id,
        transactionId: schema.transactionFuelMatches.transactionId,
        fuelLogId: schema.transactionFuelMatches.fuelLogId,
        matchType: schema.transactionFuelMatches.matchType,
        confidence: schema.transactionFuelMatches.confidence,
        isActive: schema.transactionFuelMatches.isActive,
      })
      .from(schema.transactionFuelMatches)
      .innerJoin(
        schema.transactions,
        eq(schema.transactionFuelMatches.transactionId, schema.transactions.id)
      )
      .innerJoin(
        schema.fuelLogs,
        eq(schema.transactionFuelMatches.fuelLogId, schema.fuelLogs.id)
      )
      .where(
        and(
          eq(schema.fuelLogs.driverId, driverId),
          eq(schema.transactionFuelMatches.isActive, true)
        )
      );

    const matchedTransactionIds = new Set(matches.map((m) => m.transactionId));
    const matchedFuelLogIds = new Set(matches.map((m) => m.fuelLogId));

    const matchSummaries: MatchSummary[] = matches.map((m) => ({
      transactionId: m.transactionId,
      fuelLogId: m.fuelLogId,
      matchType: m.matchType,
      confidence: parseFloat(m.confidence),
      isActive: m.isActive,
    }));

    return {
      matchedTransactionIds,
      matchedFuelLogIds,
      matches: matchSummaries,
    };
  } catch (error) {
    console.error(
      `❌ Error getting active matches for driver ${driverId}:`,
      error
    );
    throw error;
  }
};

/**
 * Process matching after data upload (called from upload services)
 */
export const processUploadMatching = async (
  uploadType: "transaction" | "fuel_log",
  driverId: string
): Promise<void> => {
  try {
    console.log(
      `🔄 Processing ${uploadType} upload matching for driver: ${driverId}`
    );
    await findMatchesForDriver(driverId);
    console.log(
      `✅ Completed ${uploadType} upload matching for driver: ${driverId}`
    );
  } catch (error) {
    console.error(`❌ Error processing ${uploadType} upload matching:`, error);
    // Don't throw - let upload continue even if matching fails
  }
};
