"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  quarterSettingsSchema,
  type QuarterSettings,
} from "@/lib/validations/quarter-settings";
import { updateQuarterSettings } from "@/lib/actions/quarter-settings-actions";

interface QuarterSettingsFormProps {
  initialData?: QuarterSettings;
}

export function QuarterSettingsForm({ initialData }: QuarterSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // Get default values
  const defaultQuarters = [];
  const year = initialData?.year || currentYear;

  if (initialData?.quarters) {
    defaultQuarters.push(...initialData.quarters);
  } else {
    // Generate default quarters for the current year
    for (let i = 1; i <= 4; i++) {
      const startMonth = (i - 1) * 3;
      const endMonth = startMonth + 2;
      defaultQuarters.push({
        quarter: i,
        startDate: new Date(year, startMonth, 1),
        endDate: new Date(year, endMonth + 1, 0), // Last day of the month
      });
    }
  }

  const form = useForm<QuarterSettings>({
    resolver: zodResolver(quarterSettingsSchema),
    defaultValues: {
      year,
      quarters: defaultQuarters,
    },
  });

  const selectedYear = form.watch("year");

  // Update default quarters when year changes
  const handleYearChange = (newYear: number) => {
    const newQuarters = [];
    for (let i = 1; i <= 4; i++) {
      const startMonth = (i - 1) * 3;
      const endMonth = startMonth + 2;
      newQuarters.push({
        quarter: i,
        startDate: new Date(newYear, startMonth, 1),
        endDate: new Date(newYear, endMonth + 1, 0),
      });
    }
    form.setValue("quarters", newQuarters);
  };

  const onSubmit = async (data: QuarterSettings) => {
    setIsLoading(true);
    try {
      const result = await updateQuarterSettings(data);

      if (result.success) {
        // Show success message - you can replace with your preferred toast library
        alert(result.message);
      } else {
        // Show error message
        alert(`Error: ${result.message}`);
      }
    } catch {
      alert("Failed to update quarter settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-white rounded-lg border p-6 mt-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium">Quarter Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure the start and end dates for each quarter of the year.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Year Selection */}
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <Select
                  value={field.value?.toString()}
                  onValueChange={(value) => {
                    const year = parseInt(value);
                    field.onChange(year);
                    handleYearChange(year);
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the year to configure quarter settings for.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Quarter Date Controls */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Quarter Date Ranges</h4>
            <div className="grid gap-6">
              {[1, 2, 3, 4].map((quarterNum) => (
                <div
                  key={quarterNum}
                  className="border rounded-lg p-4 space-y-4"
                >
                  <h5 className="font-medium">
                    Q{quarterNum} {selectedYear}
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Start Date */}
                    <FormField
                      control={form.control}
                      name={`quarters.${quarterNum - 1}.startDate`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                defaultMonth={field.value} // field.value is always defined here by form defaults and handleYearChange
                                disabled={(date) =>
                                  date.getFullYear() !== selectedYear
                                }
                                autoFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* End Date */}
                    <FormField
                      control={form.control}
                      name={`quarters.${quarterNum - 1}.endDate`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                defaultMonth={field.value} // field.value is always defined here by form defaults and handleYearChange
                                disabled={(date) =>
                                  date.getFullYear() !== selectedYear
                                }
                                autoFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Quarter Settings
          </Button>
        </form>
      </Form>
    </section>
  );
}
