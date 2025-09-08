"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createUserAction } from "@/lib/actions/create-user-action";

export function CreateUserForm() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setMessage("");

    try {
      const result = await createUserAction(formData);

      if (result?.success) {
        setMessage(`✅ User created successfully: ${result.user?.email}`);
        // Reset form
        const form = document.getElementById(
          "create-user-form"
        ) as HTMLFormElement;
        form?.reset();
      } else {
        setMessage(`❌ Error: ${result?.error || "Unknown error"}`);
      }
    } catch (error) {
      setMessage(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border max-w-md mx-auto">
      <h3 className="font-semibold text-lg mb-4">Create User (Temporary)</h3>
      <p className="text-sm text-gray-600 mb-4">
        Format:{" "}
        <code className="bg-gray-100 px-1 rounded">
          email name password role
        </code>
      </p>

      <form id="create-user-form" action={handleSubmit} className="space-y-4">
        <Input
          name="userInput"
          placeholder="nflores@company.com Nhic 12345 admin"
          required
          disabled={isLoading}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating User..." : "Create User"}
        </Button>
      </form>

      {message && (
        <div
          className={`mt-4 p-3 rounded text-sm ${
            message.startsWith("✅")
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
