"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { db } from "@/drizzle";
import { users } from "@/drizzle/schema";
import { AdminRoute } from "@/lib/routes";
import { UserRoles } from "@/lib/data-model/enum-types";
import { getCurrentUser } from "@/auth";
import { deactivateUser } from "@/lib/db/services/user-service";

export async function deleteUserAction(userId: string) {
  try {
    console.log(`Attempting to deactivate user with ID: ${userId}`);

    // Get current user to prevent self-deletion
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    if (currentUser.id === userId) {
      return {
        success: false,
        error: "You cannot deactivate your own account",
      };
    }

    // Check if user exists and get user details
    const existingUser = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
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

    // Check if user is already inactive
    if (!existingUser[0].isActive) {
      return {
        success: false,
        error: "User is already inactive",
      };
    }

    // Prevent deactivating the last active admin user
    if (existingUser[0].role === UserRoles.ADMIN) {
      const activeAdminCount = await db
        .select({ count: users.id })
        .from(users)
        .where(and(eq(users.role, UserRoles.ADMIN), eq(users.isActive, true)));

      if (activeAdminCount.length <= 1) {
        return {
          success: false,
          error: "Cannot deactivate the last active admin user",
        };
      }
    }

    // Deactivate the user
    const result = await deactivateUser(userId);

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to deactivate user",
      };
    }

    console.log("✅ User deactivated successfully:", result.user);

    // Revalidate the admin page to update the user list
    revalidatePath(AdminRoute.page);

    return {
      success: true,
      user: result.user,
    };
  } catch (error) {
    console.error("❌ Error deactivating user:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to deactivate user",
    };
  }
}
