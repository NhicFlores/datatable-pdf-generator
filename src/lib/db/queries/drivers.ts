import { db, schema, eq, and } from "@/lib/db";

/**
 * Driver-related database queries
 */

export async function findDriverByName(name: string) {
  const result = await db.query.drivers.findFirst({
    where: eq(schema.drivers.name, name),
  });
  return result;
}

export async function findDriverByNameAndBranch(name: string, branch: string) {
  const result = await db.query.drivers.findFirst({
    where: and(
      eq(schema.drivers.name, name),
      eq(schema.drivers.branch, branch)
    ),
  });
  return result;
}

export async function getAllDrivers() {
  const result = await db.query.drivers.findMany({
    orderBy: [schema.drivers.name],
  });
  return result;
}

export async function getDriversByBranch(branch: string) {
  const result = await db.query.drivers.findMany({
    where: eq(schema.drivers.branch, branch),
    orderBy: [schema.drivers.name],
  });
  return result;
}
