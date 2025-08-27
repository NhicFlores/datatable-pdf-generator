// DEPRECATED 
// "use client";

// import React from "react";
// import { Button } from "./ui/button";
// import { Download } from "lucide-react";
// import { useFuelReports } from "./data-context";
// import { downloadAllFuelTransactionsCSV } from "@/lib/csv-utils";

// interface AllFuelTransactionsExportButtonProps {
//   filename?: string;
//   label?: string;
//   variant?:
//     | "default"
//     | "outline"
//     | "secondary"
//     | "ghost"
//     | "link"
//     | "destructive";
//   size?: "default" | "sm" | "lg" | "icon";
// }

// export function AllFuelTransactionsExportButton({
//   filename = "updated-fuel-report.csv",
//   label = "Download All Fuel Transactions",
//   variant = "default",
//   size = "default",
// }: AllFuelTransactionsExportButtonProps) {
//   const { fuelReports } = useFuelReports();

//   const handleDownload = () => {
//     if (!fuelReports || fuelReports.length === 0) {
//       alert("No fuel data to export");
//       return;
//     }

//     // Count total transactions across all reports
//     const totalTransactions = fuelReports.reduce(
//       (sum, report) => sum + report.fuelTransactions.length,
//       0
//     );

//     if (totalTransactions === 0) {
//       alert("No fuel transactions to export");
//       return;
//     }

//     downloadAllFuelTransactionsCSV(fuelReports, filename);
//   };

//   // Calculate total transaction count for display
//   const totalTransactions =
//     fuelReports?.reduce(
//       (sum, report) => sum + report.fuelTransactions.length,
//       0
//     ) || 0;

//   const displayLabel = `${label} (${totalTransactions})`;

//   return (
//     <Button
//       onClick={handleDownload}
//       disabled={
//         !fuelReports || fuelReports.length === 0 || totalTransactions === 0
//       }
//       variant={variant}
//       size={size}
//       className="flex items-center gap-2"
//     >
//       <Download className="h-4 w-4" />
//       {displayLabel}
//     </Button>
//   );
// }
