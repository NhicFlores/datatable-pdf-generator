import { FuelReport } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { FuelReportRoute } from "@/lib/routes";
import { useFuelReports } from "../data-context";

export const FuelReportColumns: ColumnDef<FuelReport>[] = [
  {
    id: "driver",
    accessorKey: "driver",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Driver
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: function FuelReportDriverCell({ row }) {
      const { setSelectedFuelReport } = useFuelReports();

      function handleClick() {
        setSelectedFuelReport(row.original);
      }

      const driverName = row.getValue("driver") as string;
      const cleanedName = driverName.replace(/,/g, " ");
      return (
        <span onClick={handleClick}>
          <Link href={FuelReportRoute.detailPage(cleanedName)}>
            {cleanedName}
          </Link>
        </span>
      );
    },
  },
];
