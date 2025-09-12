"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Modal from "@/components/modal";
import { CreateFuelLogForm } from "./create-fuel-log-form";

interface CreateFuelLogButtonProps {
  driverId: string;
  className?: string;
}

export function CreateFuelLogButton({
  driverId,
  className,
}: CreateFuelLogButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = () => {
    setIsModalOpen(false);
    // Page will automatically refresh due to revalidatePath in server action
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className={className}
        size="sm"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Fuel Log
      </Button>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="space-y-4">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Add New Fuel Log
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Enter the details for the new fuel log entry.
            </p>
          </div>

          <CreateFuelLogForm
            driverId={driverId}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </Modal>
    </>
  );
}
