import { db, schema, eq, desc } from "@/lib/db";

/**
 * Fuel transaction database queries
 */

export async function getFuelTransactionsByDriver(driverId: string) {
  const result = await db.query.fuelTransactions.findMany({
    where: eq(schema.fuelTransactions.driverId, driverId),
    with: {
      driver: true,
    },
    orderBy: [desc(schema.fuelTransactions.date)],
  });
  return result;
}

export async function getFuelTransactionsByVehicle(vehicleId: string) {
  const result = await db.query.fuelTransactions.findMany({
    where: eq(schema.fuelTransactions.vehicleId, vehicleId),
    with: {
      driver: true,
    },
    orderBy: [desc(schema.fuelTransactions.date)],
  });
  return result;
}

export async function getAllFuelTransactions() {
  const result = await db.query.fuelTransactions.findMany({
    with: {
      driver: true,
    },
    orderBy: [desc(schema.fuelTransactions.date)],
  });
  return result;
}

export async function getFuelTransactionById(id: string) {
  const result = await db.query.fuelTransactions.findFirst({
    where: eq(schema.fuelTransactions.id, id),
    with: {
      driver: true,
    },
  });
  return result;
}
