"use client"

// This file is kept for reference but is no longer used
// PDF generation is now handled directly in pdf-download-button.tsx

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import type { Expense } from "@/lib/types"

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#fff",
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "16.66%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    backgroundColor: "#f0f0f0",
    fontSize: 10,
    fontWeight: "bold",
  },
  tableCol: {
    width: "16.66%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    fontSize: 8,
  },
  total: {
    marginTop: 20,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "right",
  },
})

export function ExpensePDF({
  expenses,
  totalAmount,
}: {
  expenses: Expense[]
  totalAmount: number
}) {
  const formattedTotalAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalAmount)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Expense Report</Text>

        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text>Card Holder</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>Date</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>Supplier</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>Supplier Address</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>Last 4</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>Amount</Text>
            </View>
          </View>

          {/* Table Rows */}
          {expenses.map((expense, i) => (
            <View key={i} style={styles.tableRow}>
              <View style={styles.tableCol}>
                <Text>{expense.cardHolderName}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text>{expense.currentDate}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text>{expense.supplier}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text>{expense.supplierAddress}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text>{expense.lastFourDigits}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text>
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(Number.parseFloat(expense.amount))}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.total}>Total: {formattedTotalAmount}</Text>
      </Page>
    </Document>
  )
}
