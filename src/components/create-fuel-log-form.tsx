"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StateAutocomplete } from "@/components/ui/state-autocomplete";
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
  createFuelLogSchema,
  type CreateFuelLogFormData,
} from "@/lib/validations/fuel-log";
import { createFuelLogAction } from "@/lib/actions/create-fuel-log-action";

interface CreateFuelLogFormProps {
  driverId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  onFormDataChange?: (hasData: boolean) => void;
}

export function CreateFuelLogForm({
  driverId,
  onSuccess,
  onCancel,
  onFormDataChange,
}: CreateFuelLogFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const form = useForm<CreateFuelLogFormData>({
    resolver: zodResolver(createFuelLogSchema),
    defaultValues: {
      vehicleId: "",
      date: "",
      invoiceNumber: "",
      gallons: "",
      cost: "",
      sellerState: "",
      sellerName: "",
      odometer: "",
      receipt: "",
    },
  });

  // Watch for form changes to detect if user has entered data
  const watchedValues = form.watch();
  
  useEffect(() => {
    const hasData = Object.values(watchedValues).some(value => value !== "");
    onFormDataChange?.(hasData);
  }, [watchedValues, onFormDataChange]);

  const onSubmit = async (data: CreateFuelLogFormData) => {
    setIsLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          formData.append(key, String(value));
        }
      });

      const result = await createFuelLogAction(driverId, formData);

      if (result.success) {
        setMessage("✅ Fuel log created successfully");
        form.reset(); // Reset form on success

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setMessage(`❌ Error: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      setMessage(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vehicle ID */}
            <FormField
              control={form.control}
              name="vehicleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., TRUCK-001"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Invoice Number */}
            <FormField
              control={form.control}
              name="invoiceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., INV-123456"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional invoice number for reference
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Gallons */}
            <FormField
              control={form.control}
              name="gallons"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gallons</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="e.g., 25.500"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cost */}
            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g., 89.50"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional total cost of fuel purchase
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Seller State */}
            <FormField
              control={form.control}
              name="sellerState"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seller State</FormLabel>
                  <FormControl>
                    <StateAutocomplete
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Type to search states..."
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Type to search and select a US state (excludes Hawaii & Alaska)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Seller Name */}
            <FormField
              control={form.control}
              name="sellerName"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Seller Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Shell Gas Station"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional name of the gas station or seller
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Odometer */}
            <FormField
              control={form.control}
              name="odometer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Odometer Reading</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g., 45678.50"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional vehicle odometer reading
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Receipt (Optional) */}
            <FormField
              control={form.control}
              name="receipt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Receipt Reference</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Receipt ID or file name"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional receipt reference for tracking
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Creating..." : "Create Fuel Log"}
            </Button>
          </div>
        </form>
      </Form>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`mt-4 p-3 rounded-md text-sm ${
            message.startsWith("✅")
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
