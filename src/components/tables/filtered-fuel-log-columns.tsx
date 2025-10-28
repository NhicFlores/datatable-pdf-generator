"use client";
import { FilteredFuelLog } from "@/lib/data-model/query-types";
import { SelectFuelLog } from "@/lib/data-model/schema-types";
import { formatCurrency, formatDateStringToLocal } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "../ui/button";
import { EditableCell } from "./editable-cell";

export const createFilteredFuelLogColumns = (
  matchingIds: Set<string> = new Set(),
  onUpdateField?: (
    fuelLogId: string,
    field: keyof SelectFuelLog,
    value: string | number
  ) => void,
  editable: boolean = false
): ColumnDef<FilteredFuelLog>[] => [
  {
    id: "vehicleId",
    accessorKey: "vehicleId",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Vehicle ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const fuelLogId = row.original.id;
      const isMatched = matchingIds.has(fuelLogId);

      if (editable && onUpdateField) {
        return (
          <EditableCell
            value={row.original.vehicleId}
            onUpdate={(value) =>
              onUpdateField(fuelLogId, "vehicleId", value as string)
            }
            type="text"
            isMatched={isMatched}
          />
        );
      }

      return (
        <div className={`font-medium ${isMatched ? "text-green-600 font-semibold" : ""}`}>
          {row.original.vehicleId}
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
    cell: ({ row }) => (
      <div className="font-medium">{row.original.driver || "N/A"}</div>
    ),
  },
  {
    id: "date",
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const fuelLogId = row.original.id;
      const isMatched = matchingIds.has(fuelLogId);

      if (editable && onUpdateField) {
        return (
          <EditableCell
            value={formatDateStringToLocal(row.original.date.toISOString())}
            onUpdate={(value) =>
              onUpdateField(fuelLogId, "date", value as string)
            }
            type="date"
            isMatched={isMatched}
          />
        );
      }

      return (
        <div className={isMatched ? "text-green-600 font-semibold" : ""}>
          {formatDateStringToLocal(row.original.date.toISOString())}
        </div>
      );
    },
  },
  {
    id: "invoiceNumber",
    accessorKey: "invoiceNumber",
    header: "Invoice #",
    cell: ({ row }) => {
      const fuelLogId = row.original.id;
      const isMatched = matchingIds.has(fuelLogId);

      if (editable && onUpdateField) {
        return (
          <EditableCell
            value={row.original.invoiceNumber}
            onUpdate={(value) =>
              onUpdateField(fuelLogId, "invoiceNumber", value as string)
            }
            type="text"
            isMatched={isMatched}
          />
        );
      }

      return (
        <div className={`font-mono text-sm ${isMatched ? "text-green-600 font-semibold" : ""}`}>
          {row.original.invoiceNumber}
        </div>
      );
    },
  },
  {
    id: "gallons",
    accessorKey: "gallons",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Gallons
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const fuelLogId = row.original.id;
      const isMatched = matchingIds.has(fuelLogId);

      if (editable && onUpdateField) {
        return (
          <EditableCell
            value={row.original.gallons}
            onUpdate={(value) =>
              onUpdateField(fuelLogId, "gallons", value as number)
            }
            type="number"
            step="0.01"
            min="0"
            isMatched={isMatched}
            autoEdit={false}
            autoEditCondition={(val) => typeof val === "string" && parseFloat(val) === 0}
            zeroValueText="Enter gallons"
            className="w-20"
          />
        );
      }

      return (
        <div className={`font-mono ${isMatched ? "text-green-600 font-semibold" : ""}`}>
          {parseFloat(row.original.gallons).toFixed(2)}
        </div>
      );
    },
  },
  {
    id: "cost",
    accessorKey: "cost",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Cost
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const fuelLogId = row.original.id;
      const isMatched = matchingIds.has(fuelLogId);

      if (editable && onUpdateField) {
        return (
          <EditableCell
            value={row.original.cost}
            onUpdate={(value) =>
              onUpdateField(fuelLogId, "cost", value as number)
            }
            type="number"
            step="0.01"
            min="0"
            isMatched={isMatched}
          />
        );
      }

      return (
        <div className={`font-mono ${isMatched ? "text-green-600 font-semibold" : ""}`}>
          {formatCurrency(parseFloat(row.original.cost))}
        </div>
      );
    },
  },
  {
    id: "sellerState",
    accessorKey: "sellerState",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          State
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const fuelLogId = row.original.id;
      const isMatched = matchingIds.has(fuelLogId);

      if (editable && onUpdateField) {
        return (
          <EditableCell
            value={row.original.sellerState}
            onUpdate={(value) =>
              onUpdateField(fuelLogId, "sellerState", value as string)
            }
            type="text"
            isMatched={isMatched}
          />
        );
      }

      return (
        <div className={`font-medium ${isMatched ? "text-green-600 font-semibold" : ""}`}>
          {row.original.sellerState}
        </div>
      );
    },
  },
  {
    id: "sellerName",
    accessorKey: "sellerName",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Seller
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const fuelLogId = row.original.id;
      const isMatched = matchingIds.has(fuelLogId);

      if (editable && onUpdateField) {
        return (
          <EditableCell
            value={row.original.sellerName}
            onUpdate={(value) =>
              onUpdateField(fuelLogId, "sellerName", value as string)
            }
            type="text"
            isMatched={isMatched}
            className="max-w-[200px]"
          />
        );
      }

      return (
        <div className={`max-w-[200px] truncate ${isMatched ? "text-green-600 font-semibold" : ""}`} title={row.original.sellerName}>
          {row.original.sellerName}
        </div>
      );
    },
  },
  {
    id: "odometer",
    accessorKey: "odometer",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Odometer
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const fuelLogId = row.original.id;
      const isMatched = matchingIds.has(fuelLogId);

      if (editable && onUpdateField) {
        return (
          <EditableCell
            value={row.original.odometer}
            onUpdate={(value) =>
              onUpdateField(fuelLogId, "odometer", value as number)
            }
            type="number"
            min="0"
            isMatched={isMatched}
          />
        );
      }

      return (
        <div className={`font-mono ${isMatched ? "text-green-600 font-semibold" : ""}`}>
          {parseInt(row.original.odometer).toLocaleString()}
        </div>
      );
    },
  },
];