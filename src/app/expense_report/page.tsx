import { ExpenseTable } from "@/components/expense-table"
import { getExpenses } from "@/lib/data"

export default async function ExpenseReportPage() {
  const expenses = await getExpenses()

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Company Expenses</h1>
      <ExpenseTable expenses={expenses} />
    </div>
  )
}
