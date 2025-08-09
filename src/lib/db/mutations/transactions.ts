import { db, schema, eq } from "@/lib/db";

/**
 * Transaction mutation operations
 */

export async function createTransaction(data: {
  transactionReference: string;
  cardholderName: string;
  lastFourDigits: string;
  transactionDate: Date;
  postingDate: Date;
  billingAmount: number;
  lineAmount: number;
  lineNumber: number;
  glCode: string;
  glCodeDescription?: string;
  reasonForExpense?: string;
  receiptImageName?: string;
  receiptImageReferenceId?: string;
  supplierName?: string;
  supplierCity?: string;
  supplierState?: string;
  workflowStatus?: string;
  merchantCategoryCode?: string;
  odometerReading?: number;
  fuelQuantity?: number;
  fuelType?: string;
  fuelUnitCost?: number;
  fuelUnitOfMeasure?: string;
}) {
  const result = await db
    .insert(schema.transactions)
    .values({
      transactionReference: data.transactionReference,
      cardholderName: data.cardholderName,
      lastFourDigits: data.lastFourDigits,
      transactionDate: data.transactionDate,
      postingDate: data.postingDate,
      billingAmount: data.billingAmount.toString(),
      lineAmount: data.lineAmount.toString(),
      lineNumber: data.lineNumber,
      glCode: data.glCode,
      glCodeDescription: data.glCodeDescription || null,
      reasonForExpense: data.reasonForExpense || null,
      receiptImageName: data.receiptImageName || null,
      receiptImageReferenceId: data.receiptImageReferenceId || null,
      supplierName: data.supplierName || null,
      supplierCity: data.supplierCity || null,
      supplierState: data.supplierState || null,
      workflowStatus: data.workflowStatus || null,
      merchantCategoryCode: data.merchantCategoryCode || null,
      odometerReading: data.odometerReading || null,
      fuelQuantity: data.fuelQuantity ? data.fuelQuantity.toString() : null,
      fuelType: data.fuelType || null,
      fuelUnitCost: data.fuelUnitCost ? data.fuelUnitCost.toString() : null,
      fuelUnitOfMeasure: data.fuelUnitOfMeasure || null,
    })
    .returning();

  return result[0];
}

export async function createManyTransactions(
  transactions: Array<{
    transactionReference: string;
    cardholderName: string;
    lastFourDigits: string;
    transactionDate: Date;
    postingDate: Date;
    billingAmount: number;
    lineAmount: number;
    lineNumber: number;
    glCode: string;
    glCodeDescription?: string;
    reasonForExpense?: string;
    receiptImageName?: string;
    receiptImageReferenceId?: string;
    supplierName?: string;
    supplierCity?: string;
    supplierState?: string;
    workflowStatus?: string;
    merchantCategoryCode?: string;
    odometerReading?: number;
    fuelQuantity?: number;
    fuelType?: string;
    fuelUnitCost?: number;
    fuelUnitOfMeasure?: string;
  }>
) {
  const formattedTransactions = transactions.map((tx) => ({
    transactionReference: tx.transactionReference,
    cardholderName: tx.cardholderName,
    lastFourDigits: tx.lastFourDigits,
    transactionDate: tx.transactionDate,
    postingDate: tx.postingDate,
    billingAmount: tx.billingAmount.toString(),
    lineAmount: tx.lineAmount.toString(),
    lineNumber: tx.lineNumber,
    glCode: tx.glCode,
    glCodeDescription: tx.glCodeDescription || null,
    reasonForExpense: tx.reasonForExpense || null,
    receiptImageName: tx.receiptImageName || null,
    receiptImageReferenceId: tx.receiptImageReferenceId || null,
    supplierName: tx.supplierName || null,
    supplierCity: tx.supplierCity || null,
    supplierState: tx.supplierState || null,
    workflowStatus: tx.workflowStatus || null,
    merchantCategoryCode: tx.merchantCategoryCode || null,
    odometerReading: tx.odometerReading || null,
    fuelQuantity: tx.fuelQuantity ? tx.fuelQuantity.toString() : null,
    fuelType: tx.fuelType || null,
    fuelUnitCost: tx.fuelUnitCost ? tx.fuelUnitCost.toString() : null,
    fuelUnitOfMeasure: tx.fuelUnitOfMeasure || null,
  }));

  const result = await db
    .insert(schema.transactions)
    .values(formattedTransactions)
    .returning();

  return result;
}

export async function updateTransaction(
  id: string,
  data: {
    transactionReference?: string;
    cardholderName?: string;
    lastFourDigits?: string;
    transactionDate?: Date;
    postingDate?: Date;
    billingAmount?: number;
    lineAmount?: number;
    lineNumber?: number;
    glCode?: string;
    glCodeDescription?: string;
    reasonForExpense?: string;
    receiptImageName?: string;
    receiptImageReferenceId?: string;
    supplierName?: string;
    supplierCity?: string;
    supplierState?: string;
    workflowStatus?: string;
    merchantCategoryCode?: string;
    odometerReading?: number;
    fuelQuantity?: number;
    fuelType?: string;
    fuelUnitCost?: number;
    fuelUnitOfMeasure?: string;
  }
) {
  const updateData: Record<string, string | number | Date | null> = {
    ...data,
    updatedAt: new Date(),
  };

  // Convert numbers to strings for decimal fields
  if (data.billingAmount !== undefined) {
    updateData.billingAmount = data.billingAmount.toString();
  }
  if (data.lineAmount !== undefined) {
    updateData.lineAmount = data.lineAmount.toString();
  }
  if (data.fuelQuantity !== undefined) {
    updateData.fuelQuantity = data.fuelQuantity.toString();
  }
  if (data.fuelUnitCost !== undefined) {
    updateData.fuelUnitCost = data.fuelUnitCost.toString();
  }

  const result = await db
    .update(schema.transactions)
    .set(updateData)
    .where(eq(schema.transactions.id, id))
    .returning();

  return result[0];
}
