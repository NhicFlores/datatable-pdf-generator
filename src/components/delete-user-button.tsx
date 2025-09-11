"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/modal";
import { Trash2, AlertTriangle } from "lucide-react";
import { deleteUserAction } from "@/lib/actions/delete-user-action";

interface DeactivateUserButtonProps {
  userId: string;
  userName: string;
  userEmail: string;
}

export function DeactivateUserButton({
  userId,
  userName,
  userEmail,
}: DeactivateUserButtonProps) {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const handleDeactivate = async () => {
    setIsDeactivating(true);

    try {
      const result = await deleteUserAction(userId);

      if (result.success) {
        console.log("✅ User deactivated successfully:", result.user);
        setIsConfirmModalOpen(false);
        // No need for manual refresh - revalidatePath handles it
      } else {
        console.error("❌ Failed to deactivate user:", result.error);
        if (result.error === "You cannot deactivate your own account") {
          alert(
            "You cannot deactivate your own account. Please ask another admin to deactivate your account if needed."
          );
        } else {
          alert(`Failed to deactivate user: ${result.error}`);
        }
      }
    } catch (error) {
      console.error("❌ Error deactivating user:", error);
      alert(
        `Error deactivating user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsConfirmModalOpen(true)}
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
        title={`Deactivate ${userName}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Modal
        open={isConfirmModalOpen}
        onClose={() => !isDeactivating && setIsConfirmModalOpen(false)}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Deactivate User
              </h3>
              <p className="text-sm text-gray-600">
                This will make the user unable to sign in.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm">
              Are you sure you want to deactivate the following user?
            </p>
            <div className="mt-2 space-y-1">
              <p className="font-medium text-gray-900">{userName}</p>
              <p className="text-sm text-gray-600">{userEmail}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsConfirmModalOpen(false)}
              disabled={isDeactivating}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={isDeactivating}
              className="flex items-center gap-2"
            >
              {isDeactivating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Deactivating...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Deactivate User
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
