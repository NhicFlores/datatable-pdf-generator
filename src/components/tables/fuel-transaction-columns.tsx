"use client";
import { FuelTransaction } from "@/lib/types";
import { formatCurrency, formatDateStringToLocal } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "../ui/button";
import { EditableGallonsCell } from "./editable-gallons-cell";

export const createFuelTransactionColumns = (
  matchingIds: Set<string>,
  onUpdateGallons?: (transactionId: string, gallons: number) => void
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
      // console.log("date", row.original.date);
      const fuelTransactionId = `${row.original.vehicleId}-${row.original.date}-${row.original.invoiceNumber}`;
      const isMatched = matchingIds.has(fuelTransactionId);
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
      const date = formatDateStringToLocal(row.original.date);
      const fuelTransactionId = `${row.original.vehicleId}-${row.original.date}-${row.original.invoiceNumber}`;
      const isMatched = matchingIds.has(fuelTransactionId);
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

      if (onUpdateGallons) {
        return (
          <EditableGallonsCell
            value={row.original.gallons}
            transactionId={fuelTransactionId}
            onUpdate={onUpdateGallons}
            isMatched={isMatched}
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
      return (
        <span className={isMatched ? "text-green-600 font-semibold" : ""}>
          {formatCurrency(row.original.cost)}
        </span>
      );
    },
  },
];
