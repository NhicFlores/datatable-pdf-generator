"use client";
import { SelectFuelLog } from "@/lib/data-model/schema-types";
import { formatCurrency, formatDateToLocal } from "@/lib/utils";
import { ColumnDef, Row } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "../ui/button";
import { EditableCell } from "./editable-cell";
import { DeleteFuelLogButton } from "../delete-fuel-log-button";

export const createFuelLogColumns = (
  matchingIds: Set<string>,
  onUpdateField?: (
    fuelLogId: string, // Updated to reflect actual database UUID
    field: keyof SelectFuelLog,
    value: string | number
  ) => void,
  editable: boolean = false,
  driverId?: string // Add driverId parameter for delete functionality
): ColumnDef<SelectFuelLog>[] => [
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
      const fuelLogId = row.original.id; // Use actual database UUID
      const isMatched = matchingIds.has(fuelLogId); // Use database ID for matching

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
        <span className={isMatched ? "text-green-600 font-semibold" : ""}>
          {row.original.vehicleId}
        </span>
      );
    },
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
          Transaction Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const fuelLogId = row.original.id; // Use actual database UUID

      const isMatched = matchingIds.has(fuelLogId); // Still use composite for matching logic

      if (editable && onUpdateField) {
        return (
          <EditableCell
            value={formatDateToLocal(row.original.date)}
            onUpdate={(value) =>
              onUpdateField(fuelLogId, "date", value as string)
            }
            type="date"
            isMatched={isMatched}
          />
        );
      }
      // Use direct date formatting without string conversion
      const date = formatDateToLocal(row.original.date);
      return (
        <span className={isMatched ? "text-green-600 font-semibold" : ""}>
          {date}
        </span>
      );
    },
  },
    {
    id: "invoiceNumber",
    accessorKey: "invoiceNumber",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Invoice Number
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const fuelLogId = row.original.id;

      const isMatched = matchingIds.has(fuelLogId); // Still use composite for matching logic

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
        <span className={isMatched ? "text-green-600 font-semibold" : ""}>
          {row.original.invoiceNumber}
        </span>
      );
    },
  },
    {
    id: "receipt",
    accessorKey: "receipt",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Receipt
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const fuelLogId = row.original.id;
      const isMatched = matchingIds.has(fuelLogId); // Still use composite for matching logic
      return (
        <span className={isMatched ? "text-green-600 font-semibold" : ""}>
          {row.original.receipt ? "Yes" : "No"}
        </span>
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
          Supplier / State
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const fuelLogId = row.original.id; // Use actual database UUID

      const isMatched = matchingIds.has(fuelLogId); // Still use composite for matching logic
      const sellerName = row.original.sellerName
        ? row.original.sellerName
        : "-";
      const sellerState = row.original.sellerState;

      if (editable && onUpdateField) {
        return (
          <div className="flex justify-center">
            <EditableCell
              value={sellerName}
              onUpdate={(value) =>
                onUpdateField(fuelLogId, "sellerName", value as string)
              }
              type="text"
              placeholder="Seller Name"
              isMatched={isMatched}
            />
            <EditableCell
              value={sellerState}
              onUpdate={(value) =>
                onUpdateField(fuelLogId, "sellerState", value as string)
              }
              type="text"
              placeholder="State"
              isMatched={isMatched}
            />
          </div>
        );
      }

      return (
        <span className={isMatched ? "text-green-600 font-semibold" : ""}>
          {sellerName}, {sellerState}
        </span>
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
      const isMatched = matchingIds.has(fuelLogId); // Still use composite for matching logic
      return (
        <span className={isMatched ? "text-green-600 font-semibold" : ""}>
          {row.original.odometer.toLocaleString()}
        </span>
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
      const fuelLogId = row.original.id; // Use actual database UUID

      const isMatched = matchingIds.has(fuelLogId); // Still use composite for matching logic

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
            autoEditCondition={(val) => typeof val === "number" && val === 0}
            zeroValueText="Enter gallons"
            className="w-20"
          />
        );
      }

      return (
        <span className={isMatched ? "text-green-600 font-semibold" : ""}>
          {row.original.gallons}
        </span>
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
      const fuelLogId = row.original.id; // Use actual database UUID

      const isMatched = matchingIds.has(fuelLogId); // Still use composite for matching logic

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
        <span className={isMatched ? "text-green-600 font-semibold" : ""}>
          {formatCurrency(parseFloat(row.original.cost))}
        </span>
      );
    },
  },
  // Actions column - only show if editable and driverId is provided
  ...(editable && driverId
    ? [
        {
          id: "actions",
          header: "Actions",
          cell: ({ row }: { row: Row<SelectFuelLog> }) => {
            return (
              <DeleteFuelLogButton
                fuelLogId={row.original.id}
                driverId={driverId}
                vehicleId={row.original.vehicleId}
                date={row.original.date}
              />
            );
          },
        },
      ]
    : []),
];
