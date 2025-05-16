"use client";
import { useStatements } from "@/components/data-context";
import { DataTable } from "@/components/data-table";
import { TransactionColumns } from "@/components/tables/transaction-columns";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import React from "react";

interface ExpenseReportPageProps {
  params: {
    id: string;
  };
}

export default function ExpenseReportPage({ params }: ExpenseReportPageProps) {
  const { selectedStatement } = useStatements();

// Helper to trigger browser print for PDF
  const handleDownloadPDF = () => {
    if (!selectedStatement) return;

    // Build HTML for the transactions table
    const tableRows = selectedStatement.transactions
      .map(
        (tx) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${tx.transactionDate || ""}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${tx.supplierName || ""}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${tx.glCode || ""}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${Number(tx.billingAmount).toFixed(2)}</td>
        </tr>
      `
      )
      .join("");

    // Calculate GL Code summary
    const glSummary = selectedStatement.transactions.reduce((acc, tx) => {
      if (!acc[tx.glCode]) acc[tx.glCode] = 0;
      acc[tx.glCode] += Number(tx.billingAmount) || 0;
      return acc;
    }, {} as Record<string, number>);

    const glSummaryRows = Object.entries(glSummary)
      .map(
        ([glCode, total]) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${glCode}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${Number(total).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
        </tr>
      `
      )
      .join("");

    const total = selectedStatement.transactions.reduce(
      (sum, tx) => sum + Number(tx.billingAmount || 0),
      0
    );

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Expense Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 30px; }
          h1 { text-align: center; margin-bottom: 20px; }
          .meta { margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background-color: #f2f2f2; padding: 12px 8px; border: 1px solid #ddd; text-align: left; }
          td { padding: 8px; border: 1px solid #ddd; }
          .total { text-align: right; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>Expense Report</h1>
        <div class="meta">
          <div><strong>Card Holder:</strong> ${selectedStatement.cardHolderName}</div>
          <div><strong>Card Ending:</strong> ${selectedStatement.lastFourDigits}</div>
          <div><strong>Period:</strong> ${selectedStatement.statementPeriodStartDate} &rarr; ${selectedStatement.statementPeriodEndDate}</div>
        </div>
        <h2 style="margin-top:32px;margin-bottom:8px;">GL Code Totals</h2>
        <table>
          <thead>
            <tr>
              <th>GL Code</th>
              <th>Total Billing Amount</th>
            </tr>
          </thead>
          <tbody>
            ${glSummaryRows}
          </tbody>
        </table>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Supplier</th>
              <th>GL Code</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <div class="total">Total: $${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
      </body>
      </html>
    `;

    // Open new window and print
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-slate-300">
      <div className="container py-10">
        {selectedStatement ? (
          <div>
            <div className="flex justify-end mb-4">
              <Button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Download className="w-4 h-4" />
                Download Expense Report PDF
              </Button>
            </div>
            <ReportHeader
              cardHolderName={selectedStatement.cardHolderName}
              lastFourDigits={selectedStatement.lastFourDigits}
              statementPeriodStartDate={
                selectedStatement.statementPeriodStartDate
              }
              statementPeriodEndDate={selectedStatement.statementPeriodEndDate}
            />
            <GLCodeSummaryTable transactions={selectedStatement.transactions} />

            <section className="w-full flex justify-center">
              <div className="w-full  bg-slate-100 rounded-lg shadow p-4 border border-gray-100">
                <DataTable
                  columns={TransactionColumns}
                  data={selectedStatement.transactions}
                />
              </div>
            </section>
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-10">
            No statement selected
          </div>
        )}
      </div>
    </main>
  );
}

interface ReportHeaderProps {
  cardHolderName: string;
  lastFourDigits: string;
  statementPeriodStartDate: string;
  statementPeriodEndDate: string;
}

function ReportHeader({
  cardHolderName,
  lastFourDigits,
  statementPeriodStartDate,
  statementPeriodEndDate,
}: ReportHeaderProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-100 rounded-xl shadow p-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {cardHolderName}
          </h1>
          <p className="text-gray-600 text-sm">
            Card Ending: <span className="font-semibold">{lastFourDigits}</span>
          </p>
        </div>
        <div className="flex flex-col sm:items-end">
          <span className="text-gray-700 text-sm">
            <span className="font-medium">Period:</span>{" "}
            {statementPeriodStartDate} &rarr; {statementPeriodEndDate}
          </span>
        </div>
      </div>
    </div>
  );
}

function glCodeSummary(
  transactions: {
    glCode: string;
    billingAmount: number;
  }[]
) {
  const summary = transactions.reduce((acc, transaction) => {
    const { glCode, billingAmount } = transaction;
    if (!acc[glCode]) {
      acc[glCode] = 0;
    }
    acc[glCode] += billingAmount;
    return acc;
  }, {} as Record<string, number>);

  return summary;
}

function GLCodeSummaryTable({
  transactions,
}: {
  transactions: { glCode: string; billingAmount: number }[];
}) {
  // Calculate totals per GL code
  const summary = transactions.reduce((acc, transaction) => {
    const { glCode, billingAmount } = transaction;
    if (!acc[glCode]) {
      acc[glCode] = 0;
    }
    acc[glCode] += billingAmount;
    return acc;
  }, {} as Record<string, number>);

  // Format as array for rendering
  const summaryArray = Object.entries(summary);

  if (summaryArray.length === 0) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto mb-8">
      <div className="bg-gray-50 rounded-lg shadow p-4 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">GL Code Totals</h2>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left text-gray-600 font-medium pb-2">GL Code</th>
              <th className="text-right text-gray-600 font-medium pb-2">Total Billing Amount</th>
            </tr>
          </thead>
          <tbody>
            {summaryArray.map(([glCode, total]) => (
              <tr key={glCode} className="border-t border-gray-100">
                <td className="py-1 text-gray-800">{glCode}</td>
                <td className="py-1 text-right text-gray-900 font-mono">
                  {total.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}