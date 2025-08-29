import { SelectTransaction } from "@/lib/data-model/schema-types";
import { formatCurrency } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Plus, X } from "lucide-react";
import { Button } from "../ui/button";

export const createTransactionColumns = (
  matchingIds: Set<string>,
  onAddToFuelReport?: (transaction: SelectTransaction) => void,
  onRemoveFromAudit?: (transactionReference: string) => void
): ColumnDef<SelectTransaction>[] => [
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
      const isMatched = matchingIds.has(row.original.id); // Use database ID
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
      const transactionDate = row.original.transactionDate;
      const postingDate = row.original.postingDate;
      const isMatched = matchingIds.has(row.original.id); // Use database ID

      return (
        <div className={isMatched ? "text-green-600 font-semibold" : ""}>
          <div className="font-bold">{transactionDate.toDateString()}</div>
          <div>{postingDate.toDateString()}</div>
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
      const isMatched = matchingIds.has(row.original.id); // Use database ID
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
      const isMatched = matchingIds.has(row.original.id); // Use database ID
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
      const isMatched = matchingIds.has(row.original.id); // Use database ID
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
      const isMatched = matchingIds.has(row.original.id); // Use database ID
      const fuelQuantity = row.original.fuelQuantity;
      const fuelType = row.original.fuelType;

      return (
        <div className={isMatched ? "text-green-600 font-semibold" : ""}>
          <div className="font-bold">
            {fuelQuantity ? `${parseFloat(fuelQuantity).toFixed(2)}` : "N/A"}
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
      const isMatched = matchingIds.has(row.original.id); // Use database ID
      return (
        <div className={isMatched ? "text-green-600 font-semibold" : ""}>
          <div className="font-bold">
            {formatCurrency(parseFloat(row.original.billingAmount))}
          </div>
          <div>{formatCurrency(parseFloat(row.original.lineAmount))}</div>
        </div>
      );
    },
  },
  // Add to Fuel Report Action Column
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const isMatched = matchingIds.has(row.original.id); // Use database ID

      return (
        <div className="flex items-center gap-2">
          {!isMatched && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddToFuelReport?.(row.original)}
              className="flex items-center gap-1"
              title="Add this transaction to the fuel report"
            >
              <Plus className="h-3 w-3" />
              Add to Fuel Report
            </Button>
          )}

          {/* Remove from audit button - available for unmatched transactions */}
          {!isMatched && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onRemoveFromAudit?.(row.original.transactionReference)
              }
              className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Remove from audit view (temporary)"
            >
              <X className="h-3 w-3" />
              Remove
            </Button>
          )}

          {isMatched && (
            <span className="text-green-600 text-sm">Already Matched</span>
          )}
        </div>
      );
    },
  },
];
