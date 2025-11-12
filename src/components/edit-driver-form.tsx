"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { editDriverSchema, type EditDriverFormData } from "@/lib/validations/driver";
import { getBranchCodeOptions } from "@/lib/data-model/enum-types";
import { editDriverAction } from "@/lib/actions/edit-driver-action";
import { type SelectDriver } from "@/lib/data-model/schema-types";

interface EditDriverFormProps {
  existingDriver: SelectDriver;
  onSuccess?: () => void;
}

export function EditDriverForm({ existingDriver, onSuccess }: EditDriverFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const form = useForm<EditDriverFormData>({
    resolver: zodResolver(editDriverSchema),
    defaultValues: {
      name: existingDriver.name,
      alias: existingDriver.alias || "",
      branch: existingDriver.branch as "MHK" | "DEN" | "DSM",
      lastFour: existingDriver.lastFour || "",
    },
  });

  const onSubmit = async (data: EditDriverFormData) => {
    setIsLoading(true);
    setMessage("");

    try {
      const result = await editDriverAction(existingDriver.id, data);

      if (result.success) {
        setMessage(`✅ Driver updated successfully: ${result.driver?.name}`);

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
    <div className="bg-white m-6 p-6 rounded-lg shadow-sm border max-w-md mx-auto">
      <h3 className="font-semibold text-lg mb-4">Edit Driver</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Update the driver&apos;s information.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Alias Field */}
          <FormField
            control={form.control}
            name="alias"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alias</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Optional nickname or alias"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Optional alternate name for the driver
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Branch Field */}
          <FormField
            control={form.control}
            name="branch"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a branch" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {getBranchCodeOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Driver&apos;s assigned branch location
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Last Four Field */}
          <FormField
            control={form.control}
            name="lastFour"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Four Digits</FormLabel>
                <FormControl>
                  <Input
                    placeholder="1234"
                    maxLength={4}
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Last 4 digits of driver&apos;s ID or card number (optional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Updating Driver..." : "Update Driver"}
          </Button>
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