import { ExpenseTable } from "@/components/expense-table"
import { getExpenses } from "@/lib/read-sample-csv"

export default async function SampleExpenseReportPage() {
  const expenses = await getExpenses()

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Company Expenses</h1>
      <ExpenseTable expenses={expenses} />
    </div>
  )
}
