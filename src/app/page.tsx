"use server"
import { StatementColumns } from "@/components/statement-columns";
import { StatementTable } from "@/components/statement-table";
import { getStatements } from "@/lib/data";
import { ExpenseReportRoute } from "@/lib/routes";
import Link from "next/link";

export default async function Home() {
  const statements = await getStatements();

  return (
    <main className="container mx-auto py-10">
      <div>
        <Link
          href={ExpenseReportRoute.href}
          className="border rounded p-4 bg-gray-100"
        >
          {ExpenseReportRoute.label}
        </Link>
      </div>
      <div>
        <StatementTable columns={StatementColumns} data={statements}/>
      </div>
    </main>
  );
}
