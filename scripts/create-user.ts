#!/usr/bin/env tsx

/**
 * User Management Script
 *
 * Usage:
 * npx tsx scripts/create-user.ts <email> <name> <password> [role]
 *
 * Examples:
 * npx tsx scripts/create-user.ts admin@company.com "Admin User" "securepassword" admin
 * npx tsx scripts/create-user.ts user@company.com "Regular User" "password123" user
 */

// Load environment variables from .env file
import { config } from "dotenv";
config();

import {
  createUser,
  getUserByEmail,
} from "../src/lib/db/services/user-service";

async function main() {
  // Debug: Check if environment variables are loaded
  if (!process.env.DATABASE_URL) {
    console.error("❌ Error: DATABASE_URL environment variable not found!");
    console.error("Make sure your .env file contains DATABASE_URL");
    process.exit(1);
  }

  console.log("✅ Environment variables loaded successfully");

  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.log(
      "Usage: npx tsx scripts/create-user.ts <email> <name> <password> [role]"
    );
    console.log("");
    console.log("Examples:");
    console.log(
      '  npx tsx scripts/create-user.ts admin@company.com "Admin User" "securepassword" admin'
    );
    console.log(
      '  npx tsx scripts/create-user.ts user@company.com "Regular User" "password123" user'
    );
    process.exit(1);
  }

  const [email, name, password, role = "user"] = args;

  if (!["user", "admin"].includes(role)) {
    console.error("Error: Role must be either 'user' or 'admin'");
    process.exit(1);
  }

  console.log("Creating user...");
  console.log(`Email: ${email}`);
  console.log(`Name: ${name}`);
  console.log(`Role: ${role}`);
  console.log("");

  // Check if user already exists
  const existingUser = await getUserByEmail(email);
  if (existingUser.success) {
    console.error(`Error: User with email ${email} already exists`);
    process.exit(1);
  }

  // Create the user
  const result = await createUser({
    email,
    name,
    password,
    role: role as "user" | "admin",
  });

  if (result.success) {
    console.log("✅ User created successfully!");
    console.log(`User ID: ${result.user?.id}`);
    console.log(`Email: ${result.user?.email}`);
    console.log(`Name: ${result.user?.name}`);
    console.log(`Role: ${result.user?.role}`);
    console.log(`Created: ${result.user?.createdAt}`);
  } else {
    console.error(`❌ Failed to create user: ${result.error}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});
