"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { Download, Loader2 } from "lucide-react";

// Type for the fuel log data returned from the API
interface FuelLogExportData {
  id: string;
  vehicleId: string;
  driverId: string;
  driver: string | null;
  date: string; // ISO string from API
  invoiceNumber: string;
  gallons: string;
  cost: string;
  sellerState: string;
  sellerName: string;
  odometer: string;
  receipt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AllFuelTransactionsExportButtonProps {
  selectedQuarter: string;
  filename?: string;
  label?: string;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export function AllFuelTransactionsExportButton({
  selectedQuarter,
  filename,
  label = "Export All Fuel Logs",
  variant = "default",
  size = "sm",
}: AllFuelTransactionsExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [recordCount, setRecordCount] = useState<number | null>(null);

  const handleDownload = async () => {
    setIsLoading(true);
    
    try {
      console.log(`🔄 Fetching all fuel logs for quarter: ${selectedQuarter}`);
      
      // Fetch data from API endpoint
      const response = await fetch(`/api/fuel-logs/export?quarter=${selectedQuarter}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch fuel logs: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch fuel logs");
      }

      // Update record count for display
      setRecordCount(data.fuelLogs.length);

      // Create CSV content
      const csvContent = convertToCSV(data.fuelLogs);
      
      // Generate filename if not provided
      const defaultFilename = `all_fuel_logs_${selectedQuarter}_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      
      // Trigger download
      downloadCSV(csvContent, filename || defaultFilename);
      
      console.log(`✅ Downloaded ${data.fuelLogs.length} fuel log records`);
      
    } catch (error) {
      console.error("❌ Error downloading fuel logs:", error);
      alert(`Failed to download fuel logs: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const convertToCSV = (fuelLogs: FuelLogExportData[]): string => {
    // CSV headers matching the requested format
    const headers = [
      "vehicle",
      "driver", 
      "startTime",
      "invoiceNumber",
      "gallons",
      "Cost",
      "sellerStateFullName",
      "sellerName",
      "odometer",
      "receipt"
    ];

    // Helper function to escape CSV values
    const escapeCSVValue = (value: unknown): string => {
      if (value === null || value === undefined) return "";
      
      const stringValue = String(value);
      
      // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
      if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      
      return stringValue;
    };

    // Create CSV rows
    const csvRows = [
      // Header row
      headers.join(","),
      // Data rows
      ...fuelLogs.map(log => 
        headers.map(header => {
          // Map database fields to CSV headers
          let value;
          switch (header) {
            case "vehicle":
              value = log.vehicleId;
              break;
            case "driver":
              value = log.driver;
              break;
            case "startTime":
              value = log.date ? new Date(log.date).toLocaleString() : "";
              break;
            case "invoiceNumber":
              value = log.invoiceNumber;
              break;
            case "gallons":
              value = log.gallons;
              break;
            case "Cost":
              value = log.cost;
              break;
            case "sellerStateFullName":
              value = log.sellerState;
              break;
            case "sellerName":
              value = log.sellerName;
              break;
            case "odometer":
              value = log.odometer;
              break;
            case "receipt":
              value = log.receipt;
              break;
            default:
              value = "";
          }
          return escapeCSVValue(value);
        }).join(",")
      )
    ];

    return csvRows.join("\n");
  };

  const downloadCSV = (csvContent: string, filename: string): void => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
  };

  const displayLabel = recordCount !== null 
    ? `${label} (${recordCount})` 
    : label;

  return (
    <Button
      onClick={handleDownload}
      disabled={isLoading}
      variant={variant}
      size={size}
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {isLoading ? "Fetching..." : displayLabel}
    </Button>
  );
}