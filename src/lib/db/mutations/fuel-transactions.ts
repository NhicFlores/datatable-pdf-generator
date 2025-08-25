import { db, schema, eq } from "@/lib/db";

/**
 * Fuel transaction mutation operations
 */

export async function createFuelTransaction(data: {
  vehicleId: string;
  driverId: string;
  date: Date;
  invoiceNumber: string;
  gallons: number;
  cost: number;
  sellerState: string;
  sellerName: string;
  odometer: number;
  receipt?: string;
}) {
  const result = await db
    .insert(schema.fuelTransactions)
    .values({
      vehicleId: data.vehicleId,
      driverId: data.driverId,
      date: data.date,
      invoiceNumber: data.invoiceNumber,
      gallons: data.gallons.toString(), // Convert to string for decimal field
      cost: data.cost.toString(), // Convert to string for decimal field
      sellerState: data.sellerState,
      sellerName: data.sellerName,
      odometer: data.odometer.toString(),
      receipt: data.receipt || "",
    })
    .returning();

  return result[0];
}

export async function createManyFuelTransactions(
  transactions: Array<{
    vehicleId: string;
    driverId: string;
    date: Date;
    invoiceNumber: string;
    gallons: number;
    cost: number;
    sellerState: string;
    sellerName: string;
    odometer: number;
    receipt?: string;
  }>
) {
  const formattedTransactions = transactions.map((tx) => ({
    vehicleId: tx.vehicleId,
    driverId: tx.driverId,
    date: tx.date,
    invoiceNumber: tx.invoiceNumber,
    gallons: tx.gallons.toString(),
    cost: tx.cost.toString(),
    sellerState: tx.sellerState,
    sellerName: tx.sellerName,
    odometer: tx.odometer.toString(),
    receipt: tx.receipt || "",
  }));

  const result = await db
    .insert(schema.fuelTransactions)
    .values(formattedTransactions)
    .returning();

  return result;
}

export async function updateFuelTransaction(
  id: string,
  data: {
    vehicleId?: string;
    driverId?: string;
    date?: Date;
    invoiceNumber?: string;
    gallons?: number;
    cost?: number;
    sellerState?: string;
    sellerName?: string;
    odometer?: number;
    receipt?: string;
  }
) {
  const updateData: Record<string, string | number | Date> = {
    ...data,
    updatedAt: new Date(),
  };

  // Convert numbers to strings for decimal fields
  if (data.gallons !== undefined) {
    updateData.gallons = data.gallons.toString();
  }
  if (data.cost !== undefined) {
    updateData.cost = data.cost.toString();
  }

  const result = await db
    .update(schema.fuelTransactions)
    .set(updateData)
    .where(eq(schema.fuelTransactions.id, id))
    .returning();

  return result[0];
}
