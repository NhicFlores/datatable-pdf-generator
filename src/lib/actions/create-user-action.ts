"use server";

import { createUser } from "@/lib/db/services/user-service";

export async function createUserAction(formData: FormData) {
  const input = formData.get("userInput") as string;

  if (!input) {
    console.error("No input provided");
    return { error: "No input provided" };
  }

  // Parse the input: "email name password role"
  const parts = input.trim().split(/\s+/);

  if (parts.length < 3) {
    console.error("Invalid input format. Expected: email name password [role]");
    return {
      error: "Invalid input format. Expected: email name password [role]",
    };
  }

  const [email, name, password, role = "user"] = parts;

  // Validate role
  if (!["user", "admin"].includes(role)) {
    console.error("Invalid role. Must be 'user' or 'admin'");
    return { error: "Invalid role. Must be 'user' or 'admin'" };
  }

  try {
    console.log(`Creating user: ${email}, ${name}, role: ${role}`);

    const result = await createUser({
      email,
      name,
      password,
      role: role as "user" | "admin",
    });

    if (result.success) {
      console.log("✅ User created successfully:", result.user);
      return { success: true, user: result.user };
    } else {
      console.error("❌ Failed to create user:", result.error);
      return { error: result.error };
    }
  } catch (error) {
    console.error("❌ Server action error:", error);
    return { error: "Server error occurred" };
  }
}
