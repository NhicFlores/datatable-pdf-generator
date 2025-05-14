import { getCsvData } from "@/lib/report-data";
import { ExpenseReportRoute } from "@/lib/routes";
import Link from "next/link";

export default async function Home() {
  const transactions = await getCsvData();

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
        {transactions.map((transaction, index) => (
          <div key={index} className="border p-4 mb-4">
            <h2 className="text-xl font-bold">
              {transaction.cardHolderName}
            </h2>
            <p>Date: {transaction.transactionDate}</p>
            <p>Supplier: {transaction.supplierName}</p>
            <p>Amount: {transaction.billingAmount}</p>
            {/* Add more fields as needed */}
          </div>
        ))}
      </div>
    </main>
  );
}
