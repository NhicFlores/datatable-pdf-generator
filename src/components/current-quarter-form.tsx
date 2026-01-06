"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Schema for current quarter selection
const currentQuarterSchema = z.object({
  quarterValue: z.string().min(1, "Please select a quarter"),
});

type CurrentQuarterData = z.infer<typeof currentQuarterSchema>;

interface CurrentQuarterFormProps {
  currentQuarter?: string;
  availableQuarters: Array<{
    value: string;
    label: string;
    year: number;
    quarter: number;
  }>;
  onUpdate: (quarterValue: string) => Promise<{ success: boolean; message: string }>;
}

export function CurrentQuarterForm({
  currentQuarter,
  availableQuarters,
  onUpdate,
}: CurrentQuarterFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CurrentQuarterData>({
    resolver: zodResolver(currentQuarterSchema),
    defaultValues: {
      quarterValue: currentQuarter || "",
    },
  });

  const onSubmit = async (data: CurrentQuarterData) => {
    setIsLoading(true);
    try {
      const result = await onUpdate(data.quarterValue);

      if (result.success) {
        alert(result.message);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch {
      alert("Failed to update current quarter");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-white rounded-lg border p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium">Current Quarter Setting</h3>
        <p className="text-sm text-muted-foreground">
          Set which quarter is currently active across the entire system. This will be the default quarter shown to users when they log in.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="quarterValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Active Quarter</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger className="w-[300px]">
                      <SelectValue placeholder="Select the current active quarter" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableQuarters.map((quarter) => (
                      <SelectItem key={quarter.value} value={quarter.value}>
                        {quarter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose which quarter is currently active. This affects what users see by default when they log in.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Set Current Quarter
          </Button>
        </form>
      </Form>
    </section>
  );
}