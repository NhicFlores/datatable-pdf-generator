import { db, schema, eq, desc } from "@/lib/db";

/**
 * Fuel transaction database queries
 */

export async function getFuelLogsByDriver(driverId: string) {
  const result = await db.query.fuelLogs.findMany({
    where: eq(schema.fuelLogs.driverId, driverId),
    with: {
      driver: true,
    },
    orderBy: [desc(schema.fuelLogs.date)],
  });
  return result;
}

export async function getFuelLogsByVehicle(vehicleId: string) {
  const result = await db.query.fuelLogs.findMany({
    where: eq(schema.fuelLogs.vehicleId, vehicleId),
    with: {
      driver: true,
    },
    orderBy: [desc(schema.fuelLogs.date)],
  });
  return result;
}

export async function getAllFuelLogs() {
  const result = await db.query.fuelLogs.findMany({
    with: {
      driver: true,
    },
    orderBy: [desc(schema.fuelLogs.date)],
  });
  return result;
}

export async function getFuelLogsById(id: string) {
  const result = await db.query.fuelLogs.findFirst({
    where: eq(schema.fuelLogs.id, id),
    with: {
      driver: true,
    },
  });
  return result;
}
