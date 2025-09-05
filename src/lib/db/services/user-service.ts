import bcrypt from "bcryptjs";
import { db } from "@/drizzle";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role?: "user" | "admin";
  timezone?: string;
}

export interface UpdateUserData {
  name?: string;
  role?: "user" | "admin";
  isActive?: boolean;
  timezone?: string;
}

// Create a new user
export async function createUser(userData: CreateUserData) {
  try {
    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Insert user into database
    const newUser = await db
      .insert(users)
      .values({
        email: userData.email.toLowerCase(),
        name: userData.name,
        hashedPassword,
        role: userData.role || "user",
        timezone: userData.timezone || "America/New_York",
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
      });

    return {
      success: true,
      user: newUser[0],
    };
  } catch (error) {
    console.error("Error creating user:", error);

    // Check for unique constraint violation (duplicate email)
    if (error instanceof Error && error.message.includes("unique")) {
      return {
        success: false,
        error: "A user with this email already exists",
      };
    }

    return {
      success: false,
      error: "Failed to create user",
    };
  }
}

// Update an existing user
export async function updateUser(userId: string, updateData: UpdateUserData) {
  try {
    const updatedUser = await db
      .update(users)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        isActive: users.isActive,
        updatedAt: users.updatedAt,
      });

    if (updatedUser.length === 0) {
      return {
        success: false,
        error: "User not found",
      };
    }

    return {
      success: true,
      user: updatedUser[0],
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      success: false,
      error: "Failed to update user",
    };
  }
}

// Change user password
export async function changeUserPassword(userId: string, newPassword: string) {
  try {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const updatedUser = await db
      .update(users)
      .set({
        hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
      });

    if (updatedUser.length === 0) {
      return {
        success: false,
        error: "User not found",
      };
    }

    return {
      success: true,
      user: updatedUser[0],
    };
  } catch (error) {
    console.error("Error changing password:", error);
    return {
      success: false,
      error: "Failed to change password",
    };
  }
}

// Get all users (admin function)
export async function getAllUsers() {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        isActive: users.isActive,
        timezone: users.timezone,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .orderBy(users.createdAt);

    return {
      success: true,
      users: allUsers,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      error: "Failed to fetch users",
    };
  }
}

// Get user by email
export async function getUserByEmail(email: string) {
  try {
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        isActive: users.isActive,
        timezone: users.timezone,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (user.length === 0) {
      return {
        success: false,
        error: "User not found",
      };
    }

    return {
      success: true,
      user: user[0],
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      success: false,
      error: "Failed to fetch user",
    };
  }
}

// Deactivate user (soft delete)
export async function deactivateUser(userId: string) {
  return updateUser(userId, { isActive: false });
}

// Reactivate user
export async function reactivateUser(userId: string) {
  return updateUser(userId, { isActive: true });
}
