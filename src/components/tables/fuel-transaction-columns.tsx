"use client";
import { FuelTransaction } from "@/lib/types";
import { formatCurrency, formatDateStringToLocal } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "../ui/button";
import { EditableCell } from "./editable-cell";

export const createFuelTransactionColumns = (
  matchingIds: Set<string>,
  onUpdateField?: (
    transactionId: string,
    field: keyof FuelTransaction,
    value: string | number
  ) => void,
  editable: boolean = false
): ColumnDef<FuelTransaction>[] => [
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
      const fuelTransactionId = `${row.original.vehicleId}-${row.original.date}-${row.original.invoiceNumber}`;
      const isMatched = matchingIds.has(fuelTransactionId);

      if (editable && onUpdateField) {
        return (
          <EditableCell
            value={row.original.vehicleId}
            onUpdate={(value) =>
              onUpdateField(fuelTransactionId, "vehicleId", value as string)
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
      const fuelTransactionId = `${row.original.vehicleId}-${row.original.date}-${row.original.invoiceNumber}`;
      const isMatched = matchingIds.has(fuelTransactionId);

      if (editable && onUpdateField) {
        return (
          <EditableCell
            value={row.original.date}
            onUpdate={(value) =>
              onUpdateField(fuelTransactionId, "date", value as string)
            }
            type="date"
            isMatched={isMatched}
          />
        );
      }

      const date = formatDateStringToLocal(row.original.date);
      return (
        <span className={isMatched ? "text-green-600 font-semibold" : ""}>
          {date}
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
      const fuelTransactionId = `${row.original.vehicleId}-${row.original.date}-${row.original.invoiceNumber}`;
      const isMatched = matchingIds.has(fuelTransactionId);
      const sellerName = row.original.sellerName;
      const sellerState = row.original.sellerState;

      if (editable && onUpdateField) {
        return (
          <div className="flex justify-center">
            <EditableCell
              value={sellerName}
              onUpdate={(value) =>
                onUpdateField(fuelTransactionId, "sellerName", value as string)
              }
              type="text"
              placeholder="Seller Name"
              isMatched={isMatched}
            />
            <EditableCell
              value={sellerState}
              onUpdate={(value) =>
                onUpdateField(fuelTransactionId, "sellerState", value as string)
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
      const fuelTransactionId = `${row.original.vehicleId}-${row.original.date}-${row.original.invoiceNumber}`;
      const isMatched = matchingIds.has(fuelTransactionId);

      if (editable && onUpdateField) {
        return (
          <EditableCell
            value={row.original.invoiceNumber}
            onUpdate={(value) =>
              onUpdateField(fuelTransactionId, "invoiceNumber", value as string)
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
      const fuelTransactionId = `${row.original.vehicleId}-${row.original.date}-${row.original.invoiceNumber}`;
      const isMatched = matchingIds.has(fuelTransactionId);
      return (
        <span className={isMatched ? "text-green-600 font-semibold" : ""}>
          {row.original.odometer.toLocaleString()}
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
      const fuelTransactionId = `${row.original.vehicleId}-${row.original.date}-${row.original.invoiceNumber}`;
      const isMatched = matchingIds.has(fuelTransactionId);
      return (
        <span className={isMatched ? "text-green-600 font-semibold" : ""}>
          {row.original.receipt ? "Yes" : "No"}
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
      const fuelTransactionId = `${row.original.vehicleId}-${row.original.date}-${row.original.invoiceNumber}`;
      const isMatched = matchingIds.has(fuelTransactionId);

      if (editable && onUpdateField) {
        return (
          <EditableCell
            value={row.original.gallons}
            onUpdate={(value) =>
              onUpdateField(fuelTransactionId, "gallons", value as number)
            }
            type="number"
            step="0.01"
            min="0"
            isMatched={isMatched}
            autoEdit={true}
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
      const fuelTransactionId = `${row.original.vehicleId}-${row.original.date}-${row.original.invoiceNumber}`;
      const isMatched = matchingIds.has(fuelTransactionId);

      if (editable && onUpdateField) {
        return (
          <EditableCell
            value={row.original.cost}
            onUpdate={(value) =>
              onUpdateField(fuelTransactionId, "cost", value as number)
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
          {formatCurrency(row.original.cost)}
        </span>
      );
    },
  },
];
