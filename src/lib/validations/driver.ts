import { z } from "zod";
import { BranchCodes } from "@/lib/data-model/enum-types";

// Schema for editing driver information
export const editDriverSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must not exceed 255 characters")
    .trim(),
  alias: z
    .string()
    .max(255, "Alias must not exceed 255 characters")
    .optional()
    .or(z.literal("")),
  branch: z
    .enum([
      BranchCodes.MANHATTAN,
        BranchCodes.DENVER,
        BranchCodes.DES_MOINES,
    ])
    .refine((value) => value !== undefined, {
      message: "Please select a branch",
    }),
  lastFour: z
    .string()
    .regex(/^$|^\d{4}$/, "Last four must be exactly 4 digits or empty")
    .optional()
    .or(z.literal("")),
});

export type EditDriverFormData = z.infer<typeof editDriverSchema>;