"use client";

import { useState } from "react";
import { CreateUserForm } from "@/components/create-user-form";
import { UserRoles } from "@/lib/data-model/enum-types";
import { type UserListItem } from "@/lib/data-model/schema-types";
import Modal from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DeactivateUserButton } from "@/components/delete-user-button";
import { ReactivateUserButton } from "@/components/reactivate-user-button";
import { EditUserButton } from "@/components/edit-user-button";

interface UserListProps {
  users: UserListItem[];
  currentUserId: string;
}

export default function UserList({ users, currentUserId }: UserListProps) {
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);

  const handleCreateUserSuccess = () => {
    setIsCreateUserModalOpen(false);
    // No need for window.location.reload() - revalidatePath handles it
  };

  return (
    <section className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">User Management</h2>
          <Button
            onClick={() => setIsCreateUserModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create User
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === UserRoles.ADMIN
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.branch}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {user.id === currentUserId ? (
                      <span className="text-xs text-gray-400 italic">
                        <EditUserButton user={user} />
                        Current user
                      </span>
                    ) : (
                      <div className="flex items-center gap-1">
                        <EditUserButton user={user} />
                        {user.isActive ? (
                          <DeactivateUserButton
                            userId={user.id}
                            userName={user.name}
                            userEmail={user.email}
                          />
                        ) : (
                          <ReactivateUserButton
                            userId={user.id}
                            userName={user.name}
                            userEmail={user.email}
                          />
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(!users || users.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">No users found</p>
            <p className="text-sm mt-2">
              Create your first user to get started
            </p>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <Modal
        open={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
      >
        <div className="space-y-4">
          <CreateUserForm onSuccess={handleCreateUserSuccess} />
        </div>
      </Modal>
    </section>
  );
}
