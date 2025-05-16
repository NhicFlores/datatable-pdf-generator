"use client";
import { Statement } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "./ui/button";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { ExpenseReportRoute } from "@/lib/routes";
import { useStatements } from "./data-context";

export const StatementColumns: ColumnDef<Statement>[] = [
  {
    id: "cardHolderName",
    accessorKey: "cardHolderName",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Card Holder Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: function CardholderNameCell({ row }) {
      // instead of using an arrow function, we declare a functional component so we can use hooks 
      const { setSelectedStatement } = useStatements();
      function handleClick() {
        // const { setSelectedStatement } = useStatements(); // incorrect usage
        setSelectedStatement(row.original);
      }
      return (
        <span onClick={handleClick}>
          <Link
            href={ExpenseReportRoute.detailPage(row.original.cardHolderName)}
          >
            {row.getValue("cardHolderName")}
          </Link>
        </span>
      );
    },
  },
  {
    id: "statementPeriodStartDate",
    accessorKey: "statementPeriodStartDate",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Statement Period Start Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    id: "statementPeriodEndDate",
    accessorKey: "statementPeriodEndDate",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Statement Period End Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    id: "lastFourDigits",
    accessorKey: "lastFourDigits",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last 4 Digits
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    id: "totalAmount",
    accessorKey: "totalAmount",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const totalAmount = row.original.transactions.reduce(
        (acc, transaction) => acc + (Number(transaction.billingAmount) || 0),
        0
      );
      return <div>{totalAmount}</div>;
    },
  },
];
