import { z } from "zod";

export const quarterSettingsSchema = z
  .object({
    year: z.number().min(2000).max(2035),
    quarters: z
      .array(
        z.object({
          quarter: z.number().min(1).max(4),
          startDate: z.date(),
          endDate: z.date(),
        })
      )
      .length(4),
  })
  .refine(
    (data) => {
      // Validate that quarters are in order and don't overlap
      for (let i = 0; i < data.quarters.length; i++) {
        const quarter = data.quarters[i];

        // Check that quarter number matches index + 1
        if (quarter.quarter !== i + 1) {
          return false;
        }

        // Check that start date is before end date
        if (quarter.startDate >= quarter.endDate) {
          return false;
        }

        // Check that quarters don't overlap (except for the last one)
        if (i < data.quarters.length - 1) {
          const nextQuarter = data.quarters[i + 1];
          if (quarter.endDate >= nextQuarter.startDate) {
            return false;
          }
        }
      }
      return true;
    },
    {
      message:
        "Quarters must be in order, non-overlapping, and have valid date ranges",
    }
  );

export type QuarterSettings = z.infer<typeof quarterSettingsSchema>;
