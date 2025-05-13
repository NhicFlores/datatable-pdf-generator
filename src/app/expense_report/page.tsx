import { getCsvData } from "@/lib/report-data";

export default async function ExpenseReport() {
    const transactions = await getCsvData();

    return (
        <div>
            {transactions.map((transaction, index) => (
                <div key={index} className="border p-4 mb-4">
                    <h2 className="text-xl font-bold">{transaction["Cardholder Name"]}</h2>
                    <p>Date: {transaction["Transaction - Transaction Date"]}</p>
                    <p>Supplier: {transaction["Supplier - Name"]}</p>
                    <p>Amount: {transaction["Transaction - Billing Amount"]}</p>
                    {/* Add more fields as needed */}
                </div>
            ))}
        </div>
    )
}