"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/drizzle";
import { drivers } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { editDriverSchema, type EditDriverFormData } from "@/lib/validations/driver";
import { requireAdmin } from "@/auth";
import { type SelectDriver } from "@/lib/data-model/schema-types";

export async function editDriverAction(
  driverId: string,
  data: EditDriverFormData
): Promise<{
  success: boolean;
  driver?: SelectDriver;
  error?: string;
}> {
  try {
    // Ensure user is admin
    await requireAdmin();

    // Validate the input data
    const validatedData = editDriverSchema.parse(data);

    // Check if driver exists
    const existingDriver = await db
      .select()
      .from(drivers)
      .where(eq(drivers.id, driverId))
      .limit(1);

    if (!existingDriver || existingDriver.length === 0) {
      return {
        success: false,
        error: "Driver not found",
      };
    }

    // Convert empty strings to null for database
    const updateData = {
      name: validatedData.name,
      alias: validatedData.alias?.trim() || null,
      branch: validatedData.branch,
      lastFour: validatedData.lastFour?.trim() || null,
      updatedAt: new Date(),
    };

    // Update the driver
    const updatedDriver = await db
      .update(drivers)
      .set(updateData)
      .where(eq(drivers.id, driverId))
      .returning();

    if (!updatedDriver || updatedDriver.length === 0) {
      return {
        success: false,
        error: "Failed to update driver",
      };
    }

    // Revalidate admin page to refresh the data
    revalidatePath("/admin");

    return {
      success: true,
      driver: updatedDriver[0],
    };
  } catch (error) {
    console.error("Error updating driver:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}