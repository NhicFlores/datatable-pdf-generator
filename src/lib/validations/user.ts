import { z } from "zod";
import { USER_ROLES, USER_BRANCHES } from "../data-model/enum-types";

export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please enter a valid email address"
    ),
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
  role: z.enum(USER_ROLES),
  branch: z.enum(USER_BRANCHES),
});

export const editUserSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please enter a valid email address"
    ),
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 6, {
      message: "Password must be at least 6 characters if provided",
    }),
  role: z.enum(USER_ROLES),
  branch: z.enum(USER_BRANCHES),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type EditUserFormData = z.infer<typeof editUserSchema>;
