import { db, schema, eq, and } from "@/lib/db";

/**
 * Driver mutation operations
 */

export async function createDriver(data: { name: string; branch: string }) {
  const result = await db
    .insert(schema.drivers)
    .values({
      name: data.name,
      branch: data.branch,
    })
    .returning();

  return result[0];
}

export async function createDriverIfNotExists(name: string, branch: string) {
  // First check if driver exists
  const existing = await db.query.drivers.findFirst({
    where: and(
      eq(schema.drivers.name, name),
      eq(schema.drivers.branch, branch)
    ),
  });

  if (existing) {
    return existing;
  }

  // Create new driver if doesn't exist
  return createDriver({ name, branch });
}

export async function updateDriver(
  id: string,
  data: {
    name?: string;
    branch?: string;
  }
) {
  const result = await db
    .update(schema.drivers)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(schema.drivers.id, id))
    .returning();

  return result[0];
}
