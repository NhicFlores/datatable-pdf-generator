"use client";
import { FuelReportRoute } from "@/lib/routes";
import Link from "next/link";

export default function Home() {

  return (
    <main className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Link
            href={FuelReportRoute.summaryPage}
            className="border p-1 rounded hover:bg-gray-100"
          >
            Fuel Reports
          </Link>
        </div>
      </div>
    </main>
  );
}
