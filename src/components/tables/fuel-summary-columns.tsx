import { FuelReport } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { FuelReportRoute } from "@/lib/routes";
import { useStatements } from "../data-context";
import { cleanName } from "@/lib/utils";

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
      const { setSelectedFuelReport, statements, setSelectedStatement } = useStatements();

      function handleClick() {
        setSelectedFuelReport(row.original);

        const cleanDriverName = cleanName(row.original.driver)
        const statement = statements.find(
          (s) => cleanName(s.cardHolderName) === cleanDriverName
        );

        if (statement) {
          setSelectedStatement(statement);
        } else {
          setSelectedStatement(null);
        }

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
