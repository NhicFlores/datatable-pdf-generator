"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/drizzle";
import { quarterSettings } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/auth";
import {
  quarterSettingsSchema,
  type QuarterSettings,
} from "@/lib/validations/quarter-settings";
import { AdminRoute } from "../routes";

export async function getQuarterSettings(year: number) {
  try {
    const settings = await db
      .select()
      .from(quarterSettings)
      .where(eq(quarterSettings.year, year))
      .orderBy(quarterSettings.quarterNumber);

    if (settings.length === 0) {
      // Return default quarter settings if none exist
      const defaultQuarters = [];
      for (let i = 1; i <= 4; i++) {
        const startMonth = (i - 1) * 3;
        const endMonth = startMonth + 2;
        defaultQuarters.push({
          quarter: i,
          startDate: new Date(year, startMonth, 1),
          endDate: new Date(year, endMonth + 1, 0), // Last day of the month
        });
      }
      return { year, quarters: defaultQuarters };
    }

    return {
      year,
      quarters: settings.map((setting) => ({
        quarter: setting.quarterNumber,
        startDate: setting.startDate,
        endDate: setting.endDate,
      })),
    };
  } catch (error) {
    console.error("Error fetching quarter settings:", error);
    throw new Error("Failed to fetch quarter settings");
  }
}

export async function updateQuarterSettings(data: QuarterSettings) {
  try {
    console.log("XXXXXX");
    console.log("Updating quarter settings:", data);
    // Ensure user is admin
    const user = await requireAdmin();

    // Validate the data
    const validatedData = quarterSettingsSchema.parse(data);

    // Begin transaction to update all quarters for the year
    await db.transaction(async (tx) => {
      // Delete existing quarters for this year
      await tx
        .delete(quarterSettings)
        .where(eq(quarterSettings.year, validatedData.year));

      // Insert new quarter settings
      for (const quarter of validatedData.quarters) {
        await tx.insert(quarterSettings).values({
          year: validatedData.year,
          quarterNumber: quarter.quarter,
          quarterName: `Q${quarter.quarter} ${validatedData.year}`,
          startDate: quarter.startDate,
          endDate: quarter.endDate,
          isActive: true,
          createdBy: user.id,
        });
      }
    });

    revalidatePath(AdminRoute.page);

    return {
      success: true,
      message: `Quarter settings for ${validatedData.year} updated successfully`,
    };
  } catch (error) {
    console.error("Error updating quarter settings:", error);

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: false,
      message: "Failed to update quarter settings",
    };
  }
}
