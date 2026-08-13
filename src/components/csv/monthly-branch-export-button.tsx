"use client";

import React from "react";
import { Button } from "../ui/button";
import { Download } from "lucide-react";
import { MonthlyBranchSummaryData } from "@/lib/data-model/query-types";
import { downloadMonthlyBranchSummaryCSV } from "@/lib/csv-utils";

interface MonthlyBranchExportButtonProps {
  summaryData: MonthlyBranchSummaryData;
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

export function MonthlyBranchExportButton({
  summaryData,
  filename,
  label = "Export Monthly by Branch",
  variant = "outline",
  size = "sm",
}: MonthlyBranchExportButtonProps) {
  const handleDownload = () => {
    if (!summaryData || summaryData.rows.length === 0) {
      alert("No data to export");
      return;
    }

    downloadMonthlyBranchSummaryCSV(summaryData, filename);
  };

  const dataCount = summaryData?.rows?.length || 0;
  const displayLabel = `${label} (${dataCount})`;

  return (
    <Button
      onClick={handleDownload}
      disabled={!summaryData || summaryData.rows.length === 0}
      variant={variant}
      size={size}
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      {displayLabel}
    </Button>
  );
}
