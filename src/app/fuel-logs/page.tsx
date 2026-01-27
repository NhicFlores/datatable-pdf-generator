"use client";
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useCallback, useTransition } from 'react';
import { DataTable } from "@/components/tables/data-table";
import { createFilteredFuelLogColumns } from "@/components/tables/filtered-fuel-log-columns";
import { getFilteredFuelLogs } from "@/lib/db/data-fetchers";
import { FilteredFuelLog } from "@/lib/data-model/query-types";
import { SelectFuelLog } from "@/lib/data-model/schema-types";
import { updateFuelLogFieldAction } from "@/lib/actions/fuel-actions";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

function FuelLogsContent() {
  const searchParams = useSearchParams();
  const state = searchParams.get('state');
  const truckId = searchParams.get('truckId');
  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');
  
  const [fuelLogs, setFuelLogs] = useState<FilteredFuelLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Helper function to parse date without timezone issues
  const parseUrlDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
  };

  // Helper function to format date for display (MM-DD-YYYY)
  const formatDateForDisplay = (dateString: string): string => {
    const [year, month, day] = dateString.split('-');
    return `${month}-${day}-${year}`;
  };

  // Fetch fuel logs based on filters
  const fetchFuelLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: {
        state?: string;
        truckId?: string;
        dateRange?: { startDate: Date; endDate: Date };
      } = {};
      
      if (state) filters.state = state;
      if (truckId) filters.truckId = truckId;
      
      // Parse date range from URL params (timezone-safe)
      if (startDateParam && endDateParam) {
        try {
          filters.dateRange = {
            startDate: parseUrlDate(startDateParam),
            endDate: parseUrlDate(endDateParam)
          };
        } catch (err) {
          console.error('Failed to parse date range from URL:', err);
        }
      }
      
      const logs = await getFilteredFuelLogs(filters);
      setFuelLogs(logs);
    } catch (err) {
      console.error('Failed to fetch fuel logs:', err);
      setError('Failed to load fuel logs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [state, truckId, startDateParam, endDateParam]);

  // Server Action wrapper for updating fuel log fields
  const handleUpdateFuelLogField = useCallback(
    (
      fuelLogId: string,
      field: keyof SelectFuelLog,
      value: string | number
    ) => {
      startTransition(async () => {
        const result = await updateFuelLogFieldAction(
          fuelLogId,
          field,
          value
        );
        if (!result.success) {
          console.error("Failed to update fuel log:", result.error);
          // TODO: Add proper error handling/toast notification
        } else {
          // Refresh the data after successful update
          await fetchFuelLogs();
        }
      });
    },
    [fetchFuelLogs]
  );

  useEffect(() => {
    fetchFuelLogs();
  }, [fetchFuelLogs]);

  const getPageTitle = () => {
    const dateRangeText = startDateParam && endDateParam 
      ? ` (${formatDateForDisplay(startDateParam)} to ${formatDateForDisplay(endDateParam)})` 
      : '';
    if (state && truckId) return `Fuel Logs - ${state} - Truck ${truckId}${dateRangeText}`;
    if (state) return `Fuel Logs - ${state}${dateRangeText}`;
    if (truckId) return `Fuel Logs - Truck ${truckId}${dateRangeText}`;
    return `All Fuel Logs${dateRangeText}`;
  };

  const getBreadcrumbText = () => {
    const dateRangeText = startDateParam && endDateParam 
      ? ` (${formatDateForDisplay(startDateParam)} to ${formatDateForDisplay(endDateParam)})` 
      : '';
    if (state && truckId) return `${state} & Truck ${truckId}${dateRangeText}`;
    if (state) return `${state}${dateRangeText}`;
    if (truckId) return `Truck ${truckId}${dateRangeText}`;
    return `All${dateRangeText}`;
  };

  const columns = useMemo(() => createFilteredFuelLogColumns(
    new Set<string>(), // No matching logic needed for filtered view
    handleUpdateFuelLogField,
    true // Enable editing
  ), [handleUpdateFuelLogField]);

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading fuel logs...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/quarter-summary">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Summary
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{getPageTitle()}</h1>
          <p className="text-muted-foreground">
            Showing {fuelLogs.length} fuel log{fuelLogs.length !== 1 ? 's' : ''} for {getBreadcrumbText()}
          </p>
          <p className="text-sm text-blue-600 mt-1">
            💡 Click on any cell to edit fuel log details
          </p>
        </div>
      </div>

      {/* Summary statistics */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-sm font-medium text-muted-foreground">
            Total Records
          </div>
          <div className="text-2xl font-bold">{fuelLogs.length}</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-sm font-medium text-muted-foreground">
            Total Gallons
          </div>
          <div className="text-2xl font-bold">
            {fuelLogs.reduce((sum, log) => sum + parseFloat(log.gallons || '0'), 0).toFixed(2)}
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-sm font-medium text-muted-foreground">
            Total Cost
          </div>
          <div className="text-2xl font-bold">
            ${fuelLogs.reduce((sum, log) => sum + parseFloat(log.cost || '0'), 0).toFixed(2)}
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-sm font-medium text-muted-foreground">
            Unique Trucks
          </div>
          <div className="text-2xl font-bold">
            {new Set(fuelLogs.map(log => log.vehicleId)).size}
          </div>
        </div>
      </div>

      {/* Data table */}
      <div className="rounded-md border">
        <DataTable 
          columns={columns} 
          data={fuelLogs}
        />
      </div>
    </div>
  );
}

export default function FuelLogsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    }>
      <FuelLogsContent />
    </Suspense>
  );
}
