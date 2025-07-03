"use client";
import { useStatements } from "@/components/data-context";
import { DataTable } from "@/components/tables/data-table";
import { StatementColumns } from "@/components/tables/statement-columns";
import { BulkDownloadButton } from "@/components/bulk-download-button";
import { ExpenseReportRoute } from "@/lib/routes";
import { Statement } from "@/lib/types";
import Link from "next/link";

export default function Home() {
  const statements: Statement[] = useStatements().statements;

  return (
    <main className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <Link
          href={ExpenseReportRoute.href}
          className="border rounded p-4 bg-gray-100"
        >
          {ExpenseReportRoute.label}
        </Link>
        <BulkDownloadButton statements={statements} />
      </div>
      <div>
        <DataTable columns={StatementColumns} data={statements} />
      </div>
    </main>
  );
}
