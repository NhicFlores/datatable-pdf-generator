interface ReportHeaderProps {
  headerData: {
    cardHolderName: string;
    lastFourDigits: string;
    statementPeriodStartDate: string;
    statementPeriodEndDate: string;
  };
}

export default function ReportHeader({
  headerData: {
    cardHolderName,
    lastFourDigits,
    statementPeriodStartDate,
    statementPeriodEndDate,
  },
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
