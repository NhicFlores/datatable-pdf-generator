"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/drizzle";
import { users } from "@/drizzle/schema";
import { AdminRoute } from "@/lib/routes";
import { getCurrentUser } from "@/auth";
import { updateUser, changeUserPassword } from "@/lib/db/services/user-service";
import { editUserSchema, type EditUserFormData } from "@/lib/validations/user";

export async function editUserAction(userId: string, data: EditUserFormData) {
  try {
    // Validate the input data
    const validatedData = editUserSchema.parse(data);

    console.log(
      `Editing user: ${userId}, ${validatedData.email}, ${validatedData.name}, role: ${validatedData.role}, branch: ${validatedData.branch}`
    );

    // Get current user to ensure they're authorized
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Check if user exists
    const existingUser = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
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

    // Prepare update data (excluding email and password - handle separately)
    const updateData = {
      name: validatedData.name,
      role: validatedData.role,
      branch: validatedData.branch,
    };

    // Update basic user info
    const result = await updateUser(userId, updateData);

    if (!result.success) {
      console.error("❌ Failed to update user:", result.error);
      return { success: false, error: result.error };
    }

    // Handle email update if changed
    if (validatedData.email !== existingUser[0].email) {
      // Check if new email already exists
      const emailExists = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, validatedData.email.toLowerCase()))
        .limit(1);

      if (emailExists.length > 0) {
        return {
          success: false,
          error: "Email already exists",
        };
      }

      // Update email directly
      await db
        .update(users)
        .set({ email: validatedData.email.toLowerCase() })
        .where(eq(users.id, userId));
    }

    // Handle password update if provided
    if (validatedData.password && validatedData.password.trim() !== "") {
      const passwordResult = await changeUserPassword(
        userId,
        validatedData.password
      );
      if (!passwordResult.success) {
        console.error("❌ Failed to update password:", passwordResult.error);
        return { success: false, error: passwordResult.error };
      }
    }

    console.log("✅ User updated successfully:", result.user);

    // Revalidate the admin page to show updated user
    revalidatePath(AdminRoute.page);

    return { success: true, user: result.user };
  } catch (error) {
    console.error("❌ Server action error:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Failed to update user" };
  }
}
