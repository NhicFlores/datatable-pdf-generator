import { z } from "zod";

export const createFuelLogSchema = z.object({
  vehicleId: z
    .string()
    .min(1, "Vehicle ID is required")
    .max(100, "Vehicle ID too long"),
  date: z.string().min(1, "Date is required"),
  invoiceNumber: z.string().max(255, "Invoice number too long").optional(),
  gallons: z
    .string()
    .min(1, "Gallons is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Gallons must be a positive number",
    }),
  cost: z
    .string()
    .refine((val) => val === "" || (!isNaN(Number(val)) && Number(val) > 0), {
      message: "Cost must be a positive number",
    })
    .optional(),
  sellerState: z
    .string()
    .min(1, "Seller state is required")
    .max(100, "Seller state too long"),
  sellerName: z.string().max(255, "Seller name too long").optional(),
  odometer: z
    .string()
    .refine((val) => val === "" || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: "Odometer must be a non-negative number",
    })
    .optional(),
  receipt: z.string().max(500, "Receipt reference too long").optional(),
});

export type CreateFuelLogFormData = z.infer<typeof createFuelLogSchema>;
