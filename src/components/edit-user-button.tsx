"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/modal";
import { Edit } from "lucide-react";
import { EditUserForm } from "@/components/edit-user-form";
import { type UserListItem } from "@/lib/data-model/schema-types";

interface EditUserButtonProps {
  user: UserListItem;
}

export function EditUserButton({ user }: EditUserButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        title={`Edit ${user.name}`}
      >
        <Edit className="h-4 w-4" />
      </Button>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <EditUserForm existingUser={user} onSuccess={handleSuccess} />
      </Modal>
    </>
  );
}
