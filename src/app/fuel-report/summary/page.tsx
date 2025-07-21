"use client";

import { FuelSummaryTable } from "@/components/tables/fuel-summary-table";
import { FuelSummaryExportButton } from "@/components/fuel-summary-export-button";
import { useEffect, useState } from "react";
import { FuelSummaryData } from "@/lib/types";

export default function FuelSummaryPage() {
  const [summaryData, setSummaryData] = useState<FuelSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch data from API endpoint instead of direct file access
        const response = await fetch("/api/fuel-summary");

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const summary = await response.json();
        setSummaryData(summary);
      } catch (error) {
        console.error("Error loading fuel data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <main className="container mx-auto py-10">
        <div className="text-center">
          <p>Loading fuel summary...</p>
        </div>
      </main>
    );
  }

  if (!summaryData) {
    return (
      <main className="container mx-auto py-10">
        <div className="text-center">
          <p>Error loading fuel data.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Fuel Report Summary
          </h1>
          <p className="text-muted-foreground">
            Fuel consumption summary by state and truck ID
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Summary by State and Truck
              </h2>
              <p className="text-sm text-muted-foreground">
                Total gallons consumed per state with breakdown by truck ID
              </p>
            </div>
            <FuelSummaryExportButton
              summaryData={summaryData}
              filename={`fuel_summary_${
                new Date().toISOString().split("T")[0]
              }.csv`}
              label="Export Summary"
            />
          </div>

          <FuelSummaryTable summaryData={summaryData} />
        </div>
      </div>
    </main>
  );
}
