import { FuelReport } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { FuelReportRoute } from "@/lib/routes";
import { useFuelReports, useFuelStatements } from "../data-context";
import { cleanName } from "@/lib/utils";

export const FuelReportColumns: ColumnDef<FuelReport>[] = [
  {
    id: "vehicleBranches",
    accessorKey: "vehicleBranches",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Vehicle Branches
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div>
          {row.original.vehicleBranches.map((branch, index) => (
            <span
              key={branch}
              
            >
              {index < row.original.vehicleBranches.length - 1 ? branch + ", " : branch}
            </span>
          ))}
        </div>
      );
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
      return (
        <div>
          {row.original.vehicleIds.map((vehicleId) => (
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
      const { setSelectedFuelStatement, fuelStatements } = useFuelStatements();

      function handleClick() {
        setSelectedFuelReport(row.original);

        const cleanDriverName = cleanName(row.original.driver);
        const fuelStatement = fuelStatements.find(
          (fuel) => cleanName(fuel.cardHolderName) === cleanDriverName
        );

        if (fuelStatement) {
          setSelectedFuelStatement(fuelStatement);
        } else {
          setSelectedFuelStatement(null);
        }
      }

      const driverName = row.getValue("driver") as string;
      const cleanedName = driverName ? driverName.replace(/,/g, " ") : "";
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
