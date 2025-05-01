"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import type { Expense } from "@/lib/types"

export function PDFDownloadButton({
  expenses,
  totalAmount,
}: {
  expenses: Expense[]
  totalAmount: number
}) {
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Use useEffect to ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleDownload = async () => {
    if (!isClient) return

    setIsLoading(true)

    try {
      // Create a simple HTML representation of the data
      const tableRows = expenses
        .map(
          (expense) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${expense.cardHolderName}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${expense.currentDate}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${expense.supplier}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${expense.supplierAddress}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${expense.lastFourDigits}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${Number.parseFloat(expense.amount).toFixed(2)}</td>
        </tr>
      `,
        )
        .join("")

      const formattedTotal = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(totalAmount)

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Expense Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 30px; }
            h1 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background-color: #f2f2f2; padding: 12px 8px; border: 1px solid #ddd; text-align: left; }
            td { padding: 8px; border: 1px solid #ddd; }
            .total { text-align: right; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>Expense Report</h1>
          <table>
            <thead>
              <tr>
                <th>Card Holder</th>
                <th>Date</th>
                <th>Supplier</th>
                <th>Supplier Address</th>
                <th>Last 4</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <div class="total">Total: ${formattedTotal}</div>
        </body>
        </html>
      `

      // Use browser's print functionality to generate PDF
      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        alert("Please allow pop-ups to download the PDF")
        setIsLoading(false)
        return
      }

      printWindow.document.write(htmlContent)
      printWindow.document.close()

      // Wait for content to load
      printWindow.onload = () => {
        printWindow.print()
        printWindow.onafterprint = () => {
          printWindow.close()
        }
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleDownload} disabled={!isClient || isLoading}>
      <Download className="mr-2 h-4 w-4" />
      {isLoading ? "Generating PDF..." : "Download PDF"}
    </Button>
  )
}
