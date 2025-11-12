import { requireAdmin } from "@/auth";
import { getAllUsers } from "@/lib/db/services/user-service";
import { getAllDrivers } from "@/lib/db/driver-queries";
import Header from "@/components/header";
import { QuarterSettingsWrapper } from "@/components/quarter-settings-wrapper";
import UserList from "@/components/user-list";
import { DataUploadSection } from "@/components/data-upload-section";
import { DriverManagement } from "@/components/driver-management";

export default async function AdminPage() {
  // Ensure user is admin and get current user info
  const currentUser = await requireAdmin();

  const result = await getAllUsers();
  const users = result.success ? result.users : [];

  const driverResult = await getAllDrivers();
  const drivers = driverResult.success ? driverResult.drivers : [];

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

        <DriverManagement drivers={drivers} />

        <QuarterSettingsWrapper />
      </main>
    </div>
  );
}
