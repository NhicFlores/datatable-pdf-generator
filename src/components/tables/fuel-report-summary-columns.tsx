import { FuelReportSummary } from "@/lib/data-model/query-types";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { FuelReportRoute } from "@/lib/routes";

export const FuelReportSummaryColumns: ColumnDef<FuelReportSummary>[] = [
  {
    id: "branch",
    accessorKey: "branch",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Branch
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div>{row.original.branch}</div>;
    },
  },
  {
    id: "vehicleIds",
    accessorKey: "vehicleIds",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Vehicle IDs
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const vehicleIds = row.original.vehicleIds;

      return (
        <div className="">
          {vehicleIds.sort().map((vehicleId) => (
            <span
              key={vehicleId}
              className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full"
            >
              {vehicleId}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Driver Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const driverName = row.original.name;
      const cleanedName = driverName ? driverName.replace(/,/g, " ") : "";

      return (
        <Link
          href={FuelReportRoute.detailPage(row.original.id)}
          className="hover:text-blue-800 hover:underline font-medium"
        >
          {cleanedName}
        </Link>
      );
    },
  },
];
