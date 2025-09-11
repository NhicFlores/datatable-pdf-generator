"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/drizzle";
import { users } from "@/drizzle/schema";
import { AdminRoute } from "@/lib/routes";
import { getCurrentUser } from "@/auth";
import { reactivateUser } from "@/lib/db/services/user-service";

export async function reactivateUserAction(userId: string) {
  try {
    console.log(`Attempting to reactivate user with ID: ${userId}`);

    // Get current user to ensure they're authorized
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Check if user exists and get user details
    const existingUser = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Check if user is already active
    if (existingUser[0].isActive) {
      return {
        success: false,
        error: "User is already active",
      };
    }

    // Reactivate the user
    const result = await reactivateUser(userId);

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to reactivate user",
      };
    }

    console.log("✅ User reactivated successfully:", result.user);

    // Revalidate the admin page to update the user list
    revalidatePath(AdminRoute.page);

    return {
      success: true,
      user: result.user,
    };
  } catch (error) {
    console.error("❌ Error reactivating user:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to reactivate user",
    };
  }
}
