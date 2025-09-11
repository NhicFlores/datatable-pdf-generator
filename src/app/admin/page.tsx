import { requireAdmin } from "@/auth";
import { getAllUsers } from "@/lib/db/services/user-service";
import Header from "@/components/header";
import { QuarterSettingsWrapper } from "@/components/quarter-settings-wrapper";
import UserList from "@/components/user-list";
import { DataUploadSection } from "@/components/data-upload-section";

export default async function AdminPage() {
  // Ensure user is admin and get current user info
  const currentUser = await requireAdmin();

  const result = await getAllUsers();
  const users = result.success ? result.users : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Upload data, manage users, and set system settings
          </p>
        </div>

        <DataUploadSection />

        <UserList users={users} currentUserId={currentUser.id} />

        <QuarterSettingsWrapper />
      </main>
    </div>
  );
}
