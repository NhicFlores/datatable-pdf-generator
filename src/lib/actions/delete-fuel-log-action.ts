"use server";

import { db, schema } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/auth";
import { eq } from "drizzle-orm";

export async function deleteFuelLogAction(fuelLogId: string, driverId: string) {
  try {
    // Ensure user is authenticated
    await requireAuth();

    console.log("Deleting fuel log:", fuelLogId);

    // Delete the fuel log from database
    const [deletedFuelLog] = await db
      .delete(schema.fuelLogs)
      .where(eq(schema.fuelLogs.id, fuelLogId))
      .returning();

    if (!deletedFuelLog) {
      return {
        success: false,
        error: "Fuel log not found",
      };
    }

    console.log("✅ Fuel log deleted successfully:", deletedFuelLog.id);

    // Revalidate the fuel report detail page to show updated data
    revalidatePath(`/fuel-report/${driverId}`);

    return {
      success: true,
      deletedFuelLog,
    };
  } catch (error) {
    console.error("❌ Failed to delete fuel log:", error);

    return {
      success: false,
      error: "Failed to delete fuel log. Please try again.",
    };
  }
}
