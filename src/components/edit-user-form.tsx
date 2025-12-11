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
import { editUserSchema, type EditUserFormData } from "@/lib/validations/user";
import {
  getUserRoleOptions,
  getUserBranchOptions,
  type UserRole,
  type UserBranch,
} from "@/lib/data-model/enum-types";
import { editUserAction } from "@/lib/actions/edit-user-action";
import { type UserListItem } from "@/lib/data-model/schema-types";

interface EditUserFormProps {
  existingUser: UserListItem;
  onSuccess?: () => void;
}

export function EditUserForm({ existingUser, onSuccess }: EditUserFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const form = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      email: existingUser.email,
      name: existingUser.name,
      password: "",
      role: existingUser.role as UserRole,
      branch: existingUser.branch as UserBranch,
    },
  });

  const onSubmit = async (data: EditUserFormData) => {
    setIsLoading(true);
    setMessage("");

    try {
      const result = await editUserAction(existingUser.id, data);

      if (result.success) {
        setMessage(`✅ User updated successfully: ${result.user?.email}`);

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
      <h3 className="font-semibold text-lg mb-4">Edit User</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Update the user&apos;s information and role.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="user@company.com"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Password
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Only enter a password if you want to change it
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Role Field */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {getUserRoleOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Admin users have full access to all features
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
                    {getUserBranchOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  User will only see data from their assigned branch
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Updating User..." : "Update User"}
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
