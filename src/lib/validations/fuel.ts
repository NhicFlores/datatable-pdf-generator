import { z } from 'zod';

// Limits mirror the `fuel_logs` column definitions in src/drizzle/schema.ts.
// Keep them in sync: values outside these ranges fail the insert with a
// Postgres "numeric field overflow" / "value too long" error.
export const FUEL_LOG_LIMITS = {
  vehicleId: 100, // varchar(100)
  driver: 255, // drivers.name varchar(255)
  invoiceNumber: 255, // varchar(255)
  sellerState: 100, // varchar(100)
  sellerName: 255, // varchar(255)
  receipt: 500, // varchar(500)
  gallons: 99_999.999, // numeric(8, 3)
  cost: 99_999_999.99, // numeric(10, 2)
  odometer: 99_999_999.99, // numeric(10, 2)
} as const;

const boundedString = (field: keyof typeof FUEL_LOG_LIMITS) =>
  z
    .string()
    .max(
      FUEL_LOG_LIMITS[field],
      `must be at most ${FUEL_LOG_LIMITS[field]} characters`
    );

const boundedNumber = (field: "gallons" | "cost" | "odometer") =>
  z.coerce
    .number()
    .min(-FUEL_LOG_LIMITS[field], `must be at least -${FUEL_LOG_LIMITS[field]}`)
    .max(FUEL_LOG_LIMITS[field], `must be at most ${FUEL_LOG_LIMITS[field]}`);

export const FuelCSVRowSchema = z.object({
  vehicleId: boundedString("vehicleId").min(1),
  driver: boundedString("driver").min(1),
  date: z.string().min(1),
  invoiceNumber: boundedString("invoiceNumber").min(1),
  gallons: boundedNumber("gallons"),
  cost: boundedNumber("cost"),
  sellerState: boundedString("sellerState").optional(),
  sellerName: boundedString("sellerName").optional(),
  odometer: boundedNumber("odometer").optional(),
  receipt: boundedString("receipt").optional(),
});

export type FuelCSVRow = z.infer<typeof FuelCSVRowSchema>;
