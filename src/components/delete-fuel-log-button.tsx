"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/modal";
import { deleteFuelLogAction } from "@/lib/actions/delete-fuel-log-action";

interface DeleteFuelLogButtonProps {
  fuelLogId: string;
  driverId: string;
  vehicleId: string;
  date: Date;
  className?: string;
}

export function DeleteFuelLogButton({
  fuelLogId,
  driverId,
  vehicleId,
  date,
  className,
}: DeleteFuelLogButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteFuelLogAction(fuelLogId, driverId);

        if (result.success) {
          console.log("✅ Fuel log deleted successfully");
          setIsModalOpen(false);
          // Page will automatically refresh due to revalidatePath in server action
        } else {
          console.error("❌ Failed to delete fuel log:", result.error);
          // TODO: Add proper error handling/toast notification
        }
      } catch (error) {
        console.error("❌ Error deleting fuel log:", error);
        // TODO: Add proper error handling/toast notification
      }
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className={`text-red-600 hover:text-red-700 hover:bg-red-50 ${className}`}
        disabled={isPending}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="space-y-4">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Delete Fuel Log
            </h2>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this fuel log? This action cannot
              be undone.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-sm">
              <span className="font-medium">Vehicle ID:</span> {vehicleId}
            </p>
            <p className="text-sm">
              <span className="font-medium">Date:</span> {formatDate(date)}
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete Fuel Log"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
