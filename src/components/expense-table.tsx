"use client"

import { useState } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Expense } from "@/lib/types"

// Import the PDF download button component
import { PDFDownloadButton } from "./pdf-download-button"

export function ExpenseTable({ expenses }: { expenses: Expense[] }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  // Get unique card holders for filter dropdown
  const uniqueCardHolders = Array.from(new Set(expenses.map((expense) => expense.cardHolderName)))

  // Get unique statement periods for filter dropdown
  const uniqueStatementPeriods = Array.from(new Set(expenses.map((expense) => expense.statementPeriodStartDate))).sort()

  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: "cardHolderName",
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Card Holder
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
      },
      cell: ({ row }) => <div>{row.getValue("cardHolderName")}</div>,
    },
    {
      accessorKey: "currentDate",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = row.getValue("currentDate") as string
        return <div>{date}</div>
      },
    },
    {
      accessorKey: "supplier",
      header: "Supplier",
      cell: ({ row }) => <div>{row.getValue("supplier")}</div>,
    },
    {
      accessorKey: "supplierAddress",
      header: "Supplier Address",
      cell: ({ row }) => <div>{row.getValue("supplierAddress")}</div>,
    },
    {
      accessorKey: "lastFourDigits",
      header: "Last 4",
      cell: ({ row }) => <div>{row.getValue("lastFourDigits")}</div>,
    },
    {
      accessorKey: "amount",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue("amount"))
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount)
        return <div className="text-right font-medium">{formatted}</div>
      },
    },
  ]

  const table = useReactTable({
    data: expenses,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  // Calculate total amount of filtered rows
  const filteredRows = table.getFilteredRowModel().rows
  const totalAmount = filteredRows.reduce((sum, row) => {
    return sum + Number.parseFloat(row.getValue("amount"))
  }, 0)

  const formattedTotalAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalAmount)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Filter suppliers..."
            value={(table.getColumn("supplier")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("supplier")?.setFilterValue(event.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select
            value={(table.getColumn("cardHolderName")?.getFilterValue() as string) ?? ""}
            onValueChange={(value) => {
              table.getColumn("cardHolderName")?.setFilterValue(value || undefined)
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by card holder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Card Holders</SelectItem>
              {uniqueCardHolders.map((holder) => (
                <SelectItem key={holder} value={holder}>
                  {holder}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={(table.getColumn("statementPeriodStartDate")?.getFilterValue() as string) ?? ""}
            onValueChange={(value) => {
              table.getColumn("statementPeriodStartDate")?.setFilterValue(value || undefined)
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Periods</SelectItem>
              {uniqueStatementPeriods.map((period) => (
                <SelectItem key={period} value={period}>
                  {period}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {table.getFilteredRowModel().rows.length} of {expenses.length} expenses.
          <div className="font-medium mt-2">Total: {formattedTotalAmount}</div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
          <PDFDownloadButton expenses={filteredRows.map((row) => row.original)} totalAmount={totalAmount} />
        </div>
      </div>
    </div>
  )
}
