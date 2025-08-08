"use client";
import { FuelReportRoute } from "@/lib/routes";
import Link from "next/link";

export default function Home() {
  return (
    <main className="container mx-auto py-10">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">IFTA Reporting</h1>
        </div>

        {/* Navigation Cards */}
        <div className="flex justify-center">
          <Link
            href={FuelReportRoute.summaryPage}
            className="block p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-lg transition-all"
          >
            <h2 className="text-xl font-semibold mb-2">Fuel Reports</h2>
            <p className="text-gray-600">
              View, manage, and analyze fuel transaction data. Upload CSV files
              and generate reports.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
