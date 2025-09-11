"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/modal";
import { RotateCcw, CheckCircle } from "lucide-react";
import { reactivateUserAction } from "@/lib/actions/reactivate-user-action";

interface ReactivateUserButtonProps {
  userId: string;
  userName: string;
  userEmail: string;
}

export function ReactivateUserButton({
  userId,
  userName,
  userEmail,
}: ReactivateUserButtonProps) {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);

  const handleReactivate = async () => {
    setIsReactivating(true);

    try {
      const result = await reactivateUserAction(userId);

      if (result.success) {
        console.log("✅ User reactivated successfully:", result.user);
        setIsConfirmModalOpen(false);
        // No need for manual refresh - revalidatePath handles it
      } else {
        console.error("❌ Failed to reactivate user:", result.error);
        alert(`Failed to reactivate user: ${result.error}`);
      }
    } catch (error) {
      console.error("❌ Error reactivating user:", error);
      alert(
        `Error reactivating user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsReactivating(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsConfirmModalOpen(true)}
        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
        title={`Reactivate ${userName}`}
      >
        <RotateCcw className="h-4 w-4" />
      </Button>

      <Modal
        open={isConfirmModalOpen}
        onClose={() => !isReactivating && setIsConfirmModalOpen(false)}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Reactivate User
              </h3>
              <p className="text-sm text-gray-600">
                This will allow the user to sign in again.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm">
              Are you sure you want to reactivate the following user?
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
              disabled={isReactivating}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleReactivate}
              disabled={isReactivating}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              {isReactivating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Reactivating...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4" />
                  Reactivate User
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
