"use client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "../ui/button";
import { SelectDriver } from "@/lib/data-model/schema-types";
import { EditDriverButton } from "@/components/edit-driver-button";

// Use the actual schema type for drivers
type Driver = SelectDriver;

export const createDriverManagementColumns = (): ColumnDef<Driver>[] => [
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="font-medium">
          {row.original.name}
        </div>
      );
    },
  },
  {
    id: "alias",
    accessorKey: "alias",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Alias
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div>
          {row.original.alias || "-"}
        </div>
      );
    },
  },
  {
    id: "branch",
    accessorKey: "branch",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Branch
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div>
          {row.original.branch}
        </div>
      );
    },
  },
  {
    id: "lastFour",
    accessorKey: "lastFour",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Four
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="font-mono">
          {row.original.lastFour ? `****${row.original.lastFour}` : "-"}
        </div>
      );
    },
  },
  {
    id: "isActive",
    accessorKey: "isActive",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            isActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <div className="flex gap-1 ">
          <EditDriverButton driver={row.original} />
        </div>
      );
    },
  },
];