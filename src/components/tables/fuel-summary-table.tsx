"use client";
import * as React from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FuelSummaryTableData } from "@/lib/data-model/query-types";
import { QuarterDateRange } from "@/lib/utils/quarter-utils";

interface FuelSummaryTableProps {
  summaryData: FuelSummaryTableData;
  selectedDateRange?: QuarterDateRange | null;
}

export function FuelSummaryTable({ summaryData, selectedDateRange }: FuelSummaryTableProps) {
  const { summaryRows, uniqueTruckIds } = summaryData;

  // Format number to 2 decimal places
  const formatGallons = (gallons: number) => {
    return gallons.toFixed(2);
  };

  // Calculate totals for each truck across all states
  const truckTotals = uniqueTruckIds.reduce((totals, truckId) => {
    totals[truckId] = summaryRows.reduce(
      (sum, row) => sum + row.truckGallons[truckId],
      0
    );
    return totals;
  }, {} as { [truckId: string]: number });

  // Calculate grand total
  const grandTotal = summaryRows.reduce(
    (sum, row) => sum + row.totalGallons,
    0
  );

  // Helper function to format date without timezone issues
  const formatDateForUrl = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; 
  };

  // Helper function to build URL with date range
  const buildFuelLogsUrl = (baseParams: string) => {
    let url = `/fuel-logs?${baseParams}`;
    
    if (selectedDateRange) {
      const startDate = formatDateForUrl(selectedDateRange.startDate);
      const endDate = formatDateForUrl(selectedDateRange.endDate);
      url += `&startDate=${startDate}&endDate=${endDate}`;
    }
    
    return url;
  }

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-medium">State</TableHead>
              <TableHead className="font-medium text-right">
                Total Gallons
              </TableHead>
              {uniqueTruckIds.map((truckId, index) => (
                <TableHead key={index} className="font-medium text-center">
                  <Link 
                    href={buildFuelLogsUrl(`truckId=${encodeURIComponent(truckId)}`)}
                    className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    {truckId}
                  </Link>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {summaryRows.length > 0 ? (
              <>
                {summaryRows.map((row) => (
                  <TableRow key={row.state}>
                    <TableCell className="font-medium">
                      <Link 
                        href={buildFuelLogsUrl(`state=${encodeURIComponent(row.state)}`)}
                        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                      >
                        {row.state}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatGallons(row.totalGallons)}
                    </TableCell>
                    {uniqueTruckIds.map((truckId) => (
                      <TableCell key={truckId} className="text-center">
                        {row.truckGallons[truckId] > 0 ? (
                          <Link 
                            href={buildFuelLogsUrl(`state=${encodeURIComponent(row.state)}&truckId=${encodeURIComponent(truckId)}`)}
                            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                          >
                            {formatGallons(row.truckGallons[truckId])}
                          </Link>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {/* Totals row */}
                <TableRow className="bg-muted/50 font-semibold">
                  <TableCell className="font-bold">TOTAL</TableCell>
                  <TableCell className="text-right font-bold">
                    {formatGallons(grandTotal)}
                  </TableCell>
                  {uniqueTruckIds.map((truckId) => (
                    <TableCell key={truckId} className="text-center font-bold">
                      {truckTotals[truckId] > 0
                        ? formatGallons(truckTotals[truckId])
                        : "-"}
                    </TableCell>
                  ))}
                </TableRow>
              </>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={2 + uniqueTruckIds.length}
                  className="h-24 text-center"
                >
                  No fuel data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary statistics */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-sm font-medium text-muted-foreground">
            Total States
          </div>
          <div className="text-2xl font-bold">{summaryRows.length}</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-sm font-medium text-muted-foreground">
            Total Trucks
          </div>
          <div className="text-2xl font-bold">{uniqueTruckIds.length}</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-sm font-medium text-muted-foreground">
            Total Gallons
          </div>
          <div className="text-2xl font-bold">{formatGallons(grandTotal)}</div>
        </div>
      </div>
    </div>
  );
}
