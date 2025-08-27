"use client";

import React from "react";
import { Button } from "../ui/button";
import { Download } from "lucide-react";
import { FuelSummaryTableData } from "@/lib/data-model/query-types";
import { downloadFuelSummaryCSV } from "@/lib/csv-utils";

interface FuelSummaryExportButtonProps {
  summaryData: FuelSummaryTableData;
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

export function FuelSummaryExportButton({
  summaryData,
  filename,
  label = "Export Summary",
  variant = "outline",
  size = "sm",
}: FuelSummaryExportButtonProps) {
  const handleDownload = () => {
    if (!summaryData || summaryData.summaryRows.length === 0) {
      alert("No data to export");
      return;
    }

    downloadFuelSummaryCSV(summaryData, filename);
  };

  const dataCount = summaryData?.summaryRows?.length || 0;
  const displayLabel = `${label} (${dataCount})`;

  return (
    <Button
      onClick={handleDownload}
      disabled={!summaryData || summaryData.summaryRows.length === 0}
      variant={variant}
      size={size}
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      {displayLabel}
    </Button>
  );
}
