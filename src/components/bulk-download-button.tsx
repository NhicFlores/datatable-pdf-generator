import React, { useState } from "react";
import { Button } from "./ui/button";
import { Download, Loader2 } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { ExpenseReportPDF } from "./expense-pdf";
import { Statement } from "@/lib/types";
import JSZip from "jszip";

interface BulkDownloadButtonProps {
  statements: Statement[];
}

export function BulkDownloadButton({ statements }: BulkDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAllPDFs = async () => {
    if (statements.length === 0) {
      alert("No statements available to download");
      return;
    }

    setIsGenerating(true);

    try {
      const zip = new JSZip();

      // Generate PDF for each statement
      for (const statement of statements) {
        const name =
          (statement.employeeFirstName
            ? statement.employeeFirstName + " "
            : "") +
          (statement.employeeLastName ? statement.employeeLastName : "");
        const pdfDocument = (
          <ExpenseReportPDF
            cardHolderName={name}
            lastFourDigits={statement.lastFourDigits}
            statementPeriodStartDate={statement.statementPeriodStartDate}
            statementPeriodEndDate={statement.statementPeriodEndDate}
            transactions={statement.transactions}
          />
        );

        // Generate PDF blob
        const pdfBlob = await pdf(pdfDocument).toBlob();
        const cleanedName = name.replace(/[^a-zA-Z0-9]/g, "");
        // Create filename based on statement details
        const fileName = `${cleanedName}_exp.pdf`;
        // NOTE: if you want to add statement period to the filename, remove '\' from date strings to
        // avoid creating folders in windows file system

        // Add PDF to ZIP
        zip.file(fileName, pdfBlob);
      }

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Create download link
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `all_expense_reports_${
        new Date().toISOString().split("T")[0]
      }.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDFs:", error);
      alert("Error generating PDFs. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generateAllPDFs}
      disabled={isGenerating || statements.length === 0}
      variant="default"
      size="sm"
      className="flex items-center gap-2"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating PDFs...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Download All Reports ({statements.length})
        </>
      )}
    </Button>
  );
}

// 1. Component Structure
// Takes an array of Statement objects as props
// Uses React state to track the generation process (isGenerating)
// Renders a button that shows different states (normal, loading, disabled)
// 2. PDF Generation Process
// When clicked, the button:

// Creates a ZIP container: const zip = new JSZip();

// Loops through each statement and for each one:

// Creates an ExpenseReportPDF React component with the statement data
// Converts it to a PDF blob using pdf(pdfDocument).toBlob()
// Generates a unique filename based on cardholder name, card digits, and date range
// Adds the PDF to the ZIP file: zip.file(fileName, pdfBlob)
// Creates the final ZIP file: zip.generateAsync({ type: "blob" })

// Downloads the ZIP: Creates a temporary download link and triggers it

// 3. File Naming Convention
// Each PDF is named like: John_Doe_1234_2023-01-01_2023-01-31.pdf

// Spaces in names are replaced with underscores
// Includes card holder name, last 4 digits, and statement period
// 4. User Experience Features
// Shows loading state with spinner while generating
// Displays count of reports in button text
// Disables button when no statements available
// Shows error handling with alerts
// Now let's integrate this button into your main page so users can access it:

// implemented in main page.tsx

// How to Use It:
// Main Page: You'll now see a "Download All Reports" button in the top-right corner of your main page
// Button State: The button shows how many reports are available: "Download All Reports (5)"
// Click to Download: When clicked, it will:
// Show "Generating PDFs..." with a loading spinner
// Create individual PDFs for each statement
// Package them all into a ZIP file
// Automatically download the ZIP file
// Generated Files:
// ZIP filename: all_expense_reports_2025-07-03.zip (includes today's date)
// Individual PDFs: Each named with cardholder info and dates for easy identification
// Benefits:
// ✅ No need to open each expense report individually
// ✅ All reports downloaded in one click
// ✅ Organized file naming for easy sorting
// ✅ Loading indicators for better user experience
// ✅ Error handling if something goes wrong
// The button will be disabled if there are no statements available, and it provides clear feedback during the generation process. This should save you significant time when you need to download multiple expense reports
