import React from "react";

export function GLCodeSummaryTable({
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
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          GL Code Totals
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left text-gray-600 font-medium pb-2">
                GL Code
              </th>
              <th className="text-right text-gray-600 font-medium pb-2">
                Total Billing Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {summaryArray.map(([glCode, total]) => (
              <tr key={glCode} className="border-t border-gray-100">
                <td className="py-1 text-gray-800">{glCode}</td>
                <td className="py-1 text-right text-gray-900 font-mono">
                  {total.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}