import React, { useState } from "react";
import { Button } from "./ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { FuelDiscrepancyPDF } from "./fuel-discrepancy-pdf";
import { Statement, FuelReport } from "@/lib/types";
import { getFuelExpenseDiscrepancies } from "@/lib/data";

interface FuelDiscrepancyButtonProps {
  statements: Statement[];
  fuelReports: FuelReport[];
}

export function FuelDiscrepancyButton({
  statements,
  fuelReports,
}: FuelDiscrepancyButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDiscrepancyReport = async () => {
    if (statements.length === 0 || fuelReports.length === 0) {
      alert("No statements or fuel reports available to analyze");
      return;
    }

    setIsGenerating(true);

    try {
      // Get fuel expense discrepancies
      const discrepancies = getFuelExpenseDiscrepancies(
        statements,
        fuelReports
      );

      // Generate PDF document
      const pdfDocument = (
        <FuelDiscrepancyPDF
          discrepancies={discrepancies}
          generatedDate={new Date().toISOString()}
        />
      );

      // Generate PDF blob
      const pdfBlob = await pdf(pdfDocument).toBlob();

      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `fuel_discrepancy_report_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Show summary alert
      if (discrepancies.length > 0) {
        const totalMissingTransactions = discrepancies.reduce(
          (sum: number, d) => sum + d.Transactions.length,
          0
        );
        alert(
          `Discrepancy report generated!\n\n` +
            `Found ${discrepancies.length} driver(s) with discrepancies\n` +
            `Total missing transactions: ${totalMissingTransactions}`
        );
      } else {
        alert("No fuel expense discrepancies found!");
      }
    } catch (error) {
      console.error("Error generating discrepancy report:", error);
      alert("Error generating discrepancy report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Count discrepancies for button text
  const discrepancies = getFuelExpenseDiscrepancies(statements, fuelReports);
  const discrepancyCount = discrepancies.reduce(
    (sum: number, d) => sum + d.Transactions.length,
    0
  );

  return (
    <Button
      onClick={generateDiscrepancyReport}
      disabled={
        isGenerating || statements.length === 0 || fuelReports.length === 0
      }
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating Report...
        </>
      ) : (
        <>
          <AlertTriangle className="h-4 w-4" />
          Fuel Discrepancies ({discrepancyCount})
        </>
      )}
    </Button>
  );
}
