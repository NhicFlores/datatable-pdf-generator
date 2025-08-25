import { z } from 'zod';

export const FuelCSVRowSchema = z.object({
  vehicleId: z.string().min(1),
  driver: z.string().min(1),
  date: z.string().min(1),
  invoiceNumber: z.string().min(1),
  gallons: z.coerce.number(),
  cost: z.coerce.number(),
  sellerState: z.string().optional(),
  sellerName: z.string().optional(),
  odometer: z.coerce.number().optional(),
  receipt: z.string().optional(),
});

export type FuelCSVRow = z.infer<typeof FuelCSVRowSchema>;
