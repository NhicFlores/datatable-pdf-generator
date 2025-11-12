"use client";

import { useState } from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/modal";
import { EditDriverForm } from "@/components/edit-driver-form";
import { type SelectDriver } from "@/lib/data-model/schema-types";

interface EditDriverButtonProps {
  driver: SelectDriver;
}

export function EditDriverButton({ driver }: EditDriverButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditSuccess = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className="h-8 w-8 p-0"
      >
        <Edit className="h-4 w-4" />
      </Button>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <EditDriverForm
          existingDriver={driver}
          onSuccess={handleEditSuccess}
        />
      </Modal>
    </>
  );
}