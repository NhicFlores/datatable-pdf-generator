import { Transaction } from "@/lib/types";
import { formatCurrency, formatDateStringToLocal } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "../ui/button";

export const createFuelStatementColumns = (
  matchingIds: Set<string>
): ColumnDef<Transaction>[] => [
  {
    id: "workflowStatus",
    accessorKey: "workflowStatus",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Workflow Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const isMatched = matchingIds.has(row.original.transactionReference);
      return (
        <span className={isMatched ? "text-green-600 font-semibold" : ""}>
          {row.original.workflowStatus}
        </span>
      );
    },
  },
  {
    id: "transactionDate",
    accessorKey: "transactionDate",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <div>
            <div>Transaction Date</div>
            <div>Posting Date</div>
          </div>
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const transactionDate = formatDateStringToLocal(
        row.original.transactionDate
      );
      const postingDate = formatDateStringToLocal(row.original.postingDate);
      const isMatched = matchingIds.has(row.original.transactionReference);

      return (
        <div className={isMatched ? "text-green-600 font-semibold" : ""}>
          <div className="font-bold">{transactionDate}</div>
          <div>{postingDate}</div>
        </div>
      );
    },
  },
  {
    id: "supplierState",
    accessorKey: "supplierState",
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
      const isMatched = matchingIds.has(row.original.transactionReference);
      return (
        <div className={isMatched ? "text-green-600 font-semibold" : ""}>
          <div className="font-bold">{row.original.supplierName}</div>
          <div>
            {row.original.supplierCity}, {row.original.supplierState}
          </div>
        </div>
      );
    },
  },

  {
    id: "glCode",
    accessorKey: "glCode",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <div>
            <div>GL Code</div>
            <div>GL Description</div>
          </div>
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const isMatched = matchingIds.has(row.original.transactionReference);
      return (
        <div className={isMatched ? "text-green-600 font-semibold" : ""}>
          <div className="font-bold">{row.original.glCode}</div>
          <div className="text-sm text-gray-600">
            {row.original.glCodeDescription}
          </div>
        </div>
      );
    },
  },
  {
    id: "reasonForExpense",
    accessorKey: "reasonForExpense",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Reason for Expense
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const isMatched = matchingIds.has(row.original.transactionReference);
      return (
        <span className={isMatched ? "text-green-600 font-semibold" : ""}>
          {row.original.reasonForExpense}
        </span>
      );
    },
  },
  {
    id: "fuelQuantity",
    accessorKey: "fuelQuantity",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <div>
            <div>Fuel Quantity</div>
            <div>Fuel Type</div>
          </div>
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const isMatched = matchingIds.has(row.original.transactionReference);
      const fuelQuantity = row.original.fuelQuantity;
      const fuelType = row.original.fuelType;

      return (
        <div className={isMatched ? "text-green-600 font-semibold" : ""}>
          <div className="font-bold">
            {fuelQuantity ? `${fuelQuantity.toFixed(2)}` : "N/A"}
          </div>
          <div className="text-sm text-gray-600">{fuelType || "N/A"}</div>
        </div>
      );
    },
  },
  {
    id: "billingAmount",
    accessorKey: "billingAmount",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <div>
            <div>Billing Amount</div>
            <div>Line Amount</div>
          </div>
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const isMatched = matchingIds.has(row.original.transactionReference);
      return (
        <div className={isMatched ? "text-green-600 font-semibold" : ""}>
          <div className="font-bold">
            {formatCurrency(row.original.billingAmount)}
          </div>
          <div>{formatCurrency(row.original.lineAmount)}</div>
        </div>
      );
    },
  },
];
