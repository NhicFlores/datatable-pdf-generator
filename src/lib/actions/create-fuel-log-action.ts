"use server";

import { db, schema } from "@/lib/db";
import { createFuelLogSchema } from "@/lib/validations/fuel-log";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/auth";

export async function createFuelLogAction(
  driverId: string,
  formData: FormData
) {
  try {
    // Ensure user is authenticated
    await requireAuth();

    // Extract and validate form data
    const rawData = {
      vehicleId: formData.get("vehicleId") as string,
      date: formData.get("date") as string,
      invoiceNumber: (formData.get("invoiceNumber") as string) || undefined,
      gallons: formData.get("gallons") as string,
      cost: (formData.get("cost") as string) || undefined,
      sellerState: formData.get("sellerState") as string,
      sellerName: (formData.get("sellerName") as string) || undefined,
      odometer: (formData.get("odometer") as string) || undefined,
      receipt: (formData.get("receipt") as string) || undefined,
    };

    // Validate with Zod schema
    const validationResult = createFuelLogSchema.safeParse(rawData);

    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error.issues);
      return {
        success: false,
        error: "Invalid fuel log data",
        fieldErrors: validationResult.error.issues.reduce(
          (acc: Record<string, string>, issue) => {
            const field = issue.path[0];
            if (field && typeof field === "string") {
              acc[field] = issue.message;
            }
            return acc;
          },
          {}
        ),
      };
    }

    const validData = validationResult.data;

    // Convert string numbers to proper types for database
    // Note: Some fields are required in DB schema but optional in our form
    const fuelLogData = {
      vehicleId: validData.vehicleId,
      driverId: driverId,
      date: new Date(validData.date),
      invoiceNumber: validData.invoiceNumber || "", // Default to empty string if not provided
      gallons: validData.gallons, // Drizzle handles numeric conversion
      cost: validData.cost || "0", // Default to "0" if not provided
      sellerState: validData.sellerState,
      sellerName: validData.sellerName || "", // Default to empty string if not provided
      odometer: validData.odometer || "0", // Default to "0" if not provided
      receipt: validData.receipt || null, // This field can be null in schema
    };

    // Insert into database
    console.log("Creating fuel log for driver:", driverId);
    const [newFuelLog] = await db
      .insert(schema.fuelLogs)
      .values(fuelLogData)
      .returning();

    console.log("✅ Fuel log created successfully:", newFuelLog.id);

    // Revalidate the fuel report detail page to show new data
    revalidatePath(`/fuel-report/${driverId}`);

    return {
      success: true,
      fuelLog: newFuelLog,
    };
  } catch (error) {
    console.error("❌ Failed to create fuel log:", error);

    // Check for specific database errors
    if (error instanceof Error) {
      if (error.message.includes("duplicate key")) {
        return {
          success: false,
          error:
            "A fuel log with this invoice number already exists for this driver",
        };
      }
      if (error.message.includes("foreign key")) {
        return {
          success: false,
          error: "Invalid driver ID",
        };
      }
    }

    return {
      success: false,
      error: "Failed to create fuel log. Please try again.",
    };
  }
}
