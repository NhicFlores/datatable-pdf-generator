"use client";

import { DataTable } from "@/components/tables/data-table";
import { createDriverManagementColumns } from "@/components/tables/driver-management-columns";
import { SelectDriver } from "@/lib/data-model/schema-types";
import { useMemo } from "react";

interface DriverManagementProps {
  drivers: SelectDriver[];
}

export function DriverManagement({ drivers }: DriverManagementProps) {
  // Create columns for the driver table
  const columns = useMemo(() => createDriverManagementColumns(), []);

  return (
    <section className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Driver Management</h2>
            <p className="text-sm text-muted-foreground">
              View and manage driver information
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <DataTable columns={columns} data={drivers} />
        </div>

        {(!drivers || drivers.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">No drivers found</p>
            <p className="text-sm mt-2">
              No driver data available in the system
            </p>
          </div>
        )}
      </div>
    </section>
  );
}