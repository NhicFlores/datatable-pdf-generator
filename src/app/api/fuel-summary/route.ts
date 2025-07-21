import { getFuelCsvData } from "@/lib/read-fuel-csv";
import { createFuelSummaryData } from "@/lib/data";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const fuelData = await getFuelCsvData();
    const summaryData = createFuelSummaryData(fuelData);
    return NextResponse.json(summaryData);
  } catch (error) {
    console.error("Error loading fuel summary data:", error);
    return NextResponse.json(
      { error: "Failed to load fuel data" },
      { status: 500 }
    );
  }
}
