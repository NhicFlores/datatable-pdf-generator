"use client";
import { useStatements } from "@/components/data-context";
import { StatementColumns } from "@/components/statement-columns";
import { DataTable } from "@/components/data-table";
// import { createStatements } from "@/lib/data";
import { ExpenseReportRoute } from "@/lib/routes";
import { Statement } from "@/lib/types";
import Link from "next/link";

export default function Home() {
  const statements: Statement[] = useStatements().statements;

  return (
    <main className="container mx-auto py-10">
      <div className="flex justify-between mb-4">
        <Link
          href={ExpenseReportRoute.href}
          className="border rounded p-4 bg-gray-100"
        >
          {ExpenseReportRoute.label}
        </Link>
      </div>
      <div>
        <DataTable columns={StatementColumns} data={statements} />
      </div>
    </main>
  );
}
