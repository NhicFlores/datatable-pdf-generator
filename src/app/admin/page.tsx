import { requireAdmin } from "@/auth";
import { getAllUsers } from "@/lib/db/services/user-service";
import { getAllDrivers } from "@/lib/db/driver-queries";
import Header from "@/components/header";
import { QuarterSettingsWrapper } from "@/components/quarter-settings-wrapper";
import UserList from "@/components/user-list";
import { DataUploadSection } from "@/components/data-upload-section";
import { DriverManagement } from "@/components/driver-management";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Upload data, manage users, and set system settings
          </p>
        </div>

        <Tabs defaultValue="data-upload" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="data-upload">Data Upload</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="drivers">Drivers</TabsTrigger>
            <TabsTrigger value="quarters">Quarters</TabsTrigger>
          </TabsList>

          <TabsContent value="data-upload" className="space-y-4">
            <DataUploadSection />
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <UserList users={users} currentUserId={currentUser.id} />
          </TabsContent>

          <TabsContent value="drivers" className="space-y-4">
            <DriverManagement drivers={drivers} />
          </TabsContent>

          <TabsContent value="quarters" className="space-y-4">
            <QuarterSettingsWrapper />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
