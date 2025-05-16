"use client";
import { useStatements } from "@/components/data-context";
import { DataTable } from "@/components/tables/data-table";
import { ExpenseReportPDF } from "@/components/expense-pdf";
import ReportHeader from "@/components/report-header";
import { GLCodeSummaryTable } from "@/components/tables/glcode-summary-table";
import { TransactionColumns } from "@/components/tables/transaction-columns";
import { Button } from "@/components/ui/button";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download } from "lucide-react";
import React from "react";

interface ExpenseReportPageProps {
  params: {
    id: string;
  };
}

export default function ExpenseReportPage({ params }: ExpenseReportPageProps) {
  const { selectedStatement } = useStatements();
  //   const unwrappedParams = React.use(params);

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-slate-300">
      <div className="container py-10">
        {selectedStatement ? (
          <div>
            <div className="flex justify-end items-center mb-4 space-x-1">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
                <PDFDownloadLink
                  document={
                    <ExpenseReportPDF
                      cardHolderName={selectedStatement.cardHolderName}
                      lastFourDigits={selectedStatement.lastFourDigits}
                      statementPeriodStartDate={
                        selectedStatement.statementPeriodStartDate
                      }
                      statementPeriodEndDate={
                        selectedStatement.statementPeriodEndDate
                      }
                      transactions={selectedStatement.transactions}
                    />
                  }
                  fileName={`${params.id}-expense-report.pdf`}
                >
                  {({ loading }) =>
                    loading
                      ? "Preparing document..."
                      : "Download Expense Report PDF"
                  }
                </PDFDownloadLink>
              </Button>
            </div>
            <ReportHeader
              headerData={{
                cardHolderName: selectedStatement.cardHolderName,
                lastFourDigits: selectedStatement.lastFourDigits,
                statementPeriodStartDate:
                  selectedStatement.statementPeriodStartDate,
                statementPeriodEndDate:
                  selectedStatement.statementPeriodEndDate,
              }}
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
