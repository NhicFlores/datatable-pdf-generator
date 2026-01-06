"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/drizzle";
import { quarterSettings } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
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
      return { 
        year, 
        currentQuarter: 1, // Default to Q1 as current
        quarters: defaultQuarters 
      };
    }

    // Find which quarter is marked as current
    const currentQuarterSetting = settings.find(setting => setting.isCurrent);
    const currentQuarter = currentQuarterSetting ? currentQuarterSetting.quarterNumber : 1;

    return {
      year,
      currentQuarter,
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
        const isCurrent = quarter.quarter === validatedData.currentQuarter;
        
        await tx.insert(quarterSettings).values({
          year: validatedData.year,
          quarterNumber: quarter.quarter,
          quarterName: `Q${quarter.quarter} ${validatedData.year}`,
          startDate: quarter.startDate,
          endDate: quarter.endDate,
          isActive: true,
          isCurrent,
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

export async function getCurrentQuarterFromDB(): Promise<{
  currentQuarter: string;
  currentQuarterDateRange: { startDate: Date; endDate: Date } | null;
}> {
  try {
    // Find ANY quarter marked as current, regardless of year
    const currentQuarterSetting = await db
      .select()
      .from(quarterSettings)
      .where(eq(quarterSettings.isCurrent, true))
      .limit(1);

    if (currentQuarterSetting.length > 0) {
      const setting = currentQuarterSetting[0];
      return {
        currentQuarter: `${setting.year}-Q${setting.quarterNumber}`,
        currentQuarterDateRange: {
          startDate: setting.startDate,
          endDate: setting.endDate,
        },
      };
    }

    // Fallback: if no quarter is marked as current anywhere, use Q1 of current year
    const currentYear = new Date().getFullYear();
    const q1Setting = await db
      .select()
      .from(quarterSettings)
      .where(and(
        eq(quarterSettings.year, currentYear),
        eq(quarterSettings.quarterNumber, 1)
      ))
      .limit(1);

    if (q1Setting.length > 0) {
      const setting = q1Setting[0];
      return {
        currentQuarter: `${currentYear}-Q1`,
        currentQuarterDateRange: {
          startDate: setting.startDate,
          endDate: setting.endDate,
        },
      };
    }

    // Ultimate fallback: calculate Q1 dates if no settings exist at all
    const q1Start = new Date(currentYear, 0, 1);
    const q1End = new Date(currentYear, 2, 31);
    
    return {
      currentQuarter: `${currentYear}-Q1`,
      currentQuarterDateRange: {
        startDate: q1Start,
        endDate: q1End,
      },
    };
  } catch (error) {
    console.error("Error fetching current quarter from DB:", error);
    
    // Fallback to Q1 of current year
    const fallbackYear = new Date().getFullYear();
    return {
      currentQuarter: `${fallbackYear}-Q1`,
      currentQuarterDateRange: {
        startDate: new Date(fallbackYear, 0, 1),
        endDate: new Date(fallbackYear, 2, 31),
      },
    };
  }
}

export async function getAllActiveQuarters() {
  try {
    const settings = await db
      .select()
      .from(quarterSettings)
      .where(eq(quarterSettings.isActive, true))
      .orderBy(quarterSettings.year, quarterSettings.quarterNumber);

    return settings.map((setting) => ({
      quarter: setting.quarterNumber,
      year: setting.year,
      startDate: setting.startDate,
      endDate: setting.endDate,
      isCurrent: setting.isCurrent,
    }));
  } catch (error) {
    console.error("Error fetching active quarters:", error);
    throw new Error("Failed to fetch active quarters");
  }
}
