"use server";

import { revalidatePath } from "next/cache";
import { createUser } from "@/lib/db/services/user-service";
import {
  createUserSchema,
  type CreateUserFormData,
} from "@/lib/validations/user";
import { AdminRoute } from "@/lib/routes";

export async function createUserAction(data: CreateUserFormData) {
  try {
    // Validate the input data
    const validatedData = createUserSchema.parse(data);

    console.log(
      `Creating user: ${validatedData.email}, ${validatedData.name}, role: ${validatedData.role}, branch: ${validatedData.branch}`
    );

    const result = await createUser({
      email: validatedData.email,
      name: validatedData.name,
      password: validatedData.password,
      role: validatedData.role,
      branch: validatedData.branch,
    });

    if (result.success) {
      console.log("✅ User created successfully:", result.user);

      // Revalidate the admin page to show new user
      revalidatePath(AdminRoute.page);

      return { success: true, user: result.user };
    } else {
      console.error("❌ Failed to create user:", result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error("❌ Server action error:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Server error occurred" };
  }
}
