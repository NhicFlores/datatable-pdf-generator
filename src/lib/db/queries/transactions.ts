import { db, schema, eq, desc } from "@/lib/db";

/**
 * Transaction database queries
 */

export async function getTransactionsByCardholder(cardholderName: string) {
  const result = await db.query.transactions.findMany({
    where: eq(schema.transactions.cardholderName, cardholderName),
    orderBy: [desc(schema.transactions.transactionDate)],
  });
  return result;
}

export async function getTransactionsByGLCode(glCode: string) {
  const result = await db.query.transactions.findMany({
    where: eq(schema.transactions.glCode, glCode),
    orderBy: [desc(schema.transactions.transactionDate)],
  });
  return result;
}

export async function getAllTransactions() {
  const result = await db.query.transactions.findMany({
    orderBy: [desc(schema.transactions.transactionDate)],
  });
  return result;
}

export async function getTransactionById(id: string) {
  const result = await db.query.transactions.findFirst({
    where: eq(schema.transactions.id, id),
  });
  return result;
}

export async function getTransactionByReference(transactionReference: string) {
  const result = await db.query.transactions.findFirst({
    where: eq(schema.transactions.transactionReference, transactionReference),
  });
  return result;
}
