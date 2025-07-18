import { Transaction } from "@/lib/types";
import { formatCurrency, formatDateStringToLocal } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CheckCircle, XCircle } from "lucide-react";
import { Button } from "../ui/button";

export const TransactionColumns: ColumnDef<Transaction>[] = [
  {
    id: "workflowStatus",
    accessorKey: "workflowStatus",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          className="flex items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Approved
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const workflowStatus = row.original.workflowStatus;

      if (workflowStatus === "Approved") {
        return (
          <div className="flex items-center justify-center text-green-600">
            <CheckCircle className="w-4 h-4" />
          </div>
        );
      }

      if (workflowStatus === "Approval Required") {
        return (
          <div className="flex items-center justify-center text-red-500">
            <XCircle className="w-4 h-4 " />
          </div>
        );
      }

      return <div className="border">{workflowStatus}</div>;
    },
  },
  {
    id: "transactionDate",
    accessorKey: "transactionDate",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          className="flex items-center"
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

      return (
        <div>
          <div className="font-bold">{transactionDate}</div>
          <div>{postingDate}</div>
        </div>
      );
    },
  },
  {
    id: "supplierName",
    accessorKey: "supplierName",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          className="flex items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Supplier
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const supplierName = row.original.supplierName;
      const supplierCity = row.original.supplierCity;
      const supplierState = row.original.supplierState;
      const supplierCityState = `${supplierCity}, ${supplierState}`;
      // const supplierCityStateFormatted = supplierCityState.replace(/, /g, ",");
      return (
        <div>
          {supplierName}, {supplierCityState}
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
          className="flex items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          GL Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const glCode = row.original.glCode;
      return <div>{glCode}</div>;
    },
  },
  {
    id: "glCodeDescription",
    accessorKey: "glCodeDescription",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          className="flex items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          GL Code Description
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const glCodeDescription = row.original.glCodeDescription;
      return <div>{glCodeDescription}</div>;
    },
  },
  {
    id: "reasonForExpense",
    accessorKey: "reasonForExpense",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          className="flex items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Reason for Expense
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const reasonForExpense = row.original.reasonForExpense;
      return <div>{reasonForExpense}</div>;
    },
  },
  {
    id: "receiptImageReferenceId",
    accessorKey: "receiptImageReferenceId",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          className="flex items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Receipt Image Reference ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const receipt = row.original.receiptImageReferenceId ? "Yes" : "No";
      return <div>{receipt}</div>;
    },
  },
  {
    id: "lineAmount",
    accessorKey: "lineAmount",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          className="flex items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Line Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      // const amount = row.original.lineAmount;
      // const formattedAmount = formatCurrency(Number(amount));
      const lineNum = row.original.lineNumber;
      const formattedLineAmount = formatCurrency(
        Number(row.original.lineAmount)
      );
      return (
        <div>
          {
            <div>
              Line {lineNum}: {formattedLineAmount}
            </div>
          }
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
          className="flex items-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Billing Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = row.original.billingAmount;

      // Check if amount is null, undefined, or not a valid number
      if (amount === null || amount === undefined || isNaN(Number(amount))) {
        return <div>-</div>;
      }

      const formattedAmount = formatCurrency(Number(amount));
      return <div>{formattedAmount}</div>;
    },
  },
];
