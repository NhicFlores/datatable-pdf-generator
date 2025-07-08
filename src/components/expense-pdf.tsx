import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { Transaction } from "@/lib/types";

interface ExpenseReportPDFProps {
  cardHolderName: string;
  lastFourDigits: string;
  statementPeriodStartDate: string;
  statementPeriodEndDate: string;
  transactions: Transaction[];
}

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#fff",
    padding: 30,
    fontSize: 8,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  meta: {
    marginBottom: 14,
    fontSize: 10,
  },
  metaRow: {
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 12,
    marginTop: 14,
    marginBottom: 6,
    fontWeight: "bold",
    color: "#333",
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 10,
  },
  glSummaryTable: {
    display: "flex",
    width: "50%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 2,
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
  },
  tableCol: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 2,
  },
  // Column widths for the new table structure
  colApproved: { width: "8%" },
  colDate: { width: "12%", textAlign: "center" },
  colAmount: { width: "10%", textAlign: "right" },
  colLineAmount: { width: "10%", textAlign: "right" },
  colGlCode: { width: "8%" },
  colGlDescription: { width: "15%" },
  colReason: { width: "15%" },
  colReceiptId: { width: "10%" },
  colSupplier: { width: "12%" },

  total: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "right",
    paddingRight: 10,
  },
  checkmark: {
    color: "#16a34a",
    textAlign: "center",
  },
  xmark: {
    color: "#dc2626",
    textAlign: "center",
  },
});

function getGLSummary(transactions: Transaction[]) {
  const summary = transactions.reduce((acc, tx) => {
    if (!acc[tx.glCode]) acc[tx.glCode] = 0;
    acc[tx.glCode] += Number(tx.billingAmount) || 0;
    return acc;
  }, {} as Record<string, number>);
  return Object.entries(summary);
}

function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "-";
  }
  return Number(amount).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function formatDate(dateString: string): string {
  if (!dateString) return "-";
  // You can customize this format based on your needs
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

export function ExpenseReportPDF({
  cardHolderName,
  lastFourDigits,
  statementPeriodStartDate,
  statementPeriodEndDate,
  transactions,
}: ExpenseReportPDFProps) {
  const glSummary = getGLSummary(transactions);
  const total = transactions.reduce(
    (sum, tx) => sum + Number(tx.billingAmount || 0),
    0
  );

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <Text style={styles.title}>Expense Report</Text>
        <View style={styles.meta}>
          <Text style={styles.metaRow}>
            <Text style={{ fontWeight: "bold" }}>Card Holder:</Text>{" "}
            {cardHolderName}
          </Text>
          <Text style={styles.metaRow}>
            <Text style={{ fontWeight: "bold" }}>Card Ending:</Text>{" "}
            {lastFourDigits}
          </Text>
          <Text style={styles.metaRow}>
            <Text style={{ fontWeight: "bold" }}>Period:</Text>{" "}
            {statementPeriodStartDate} - {statementPeriodEndDate}
          </Text>
        </View>

        {/* GL Code Summary */}
        <Text style={styles.sectionTitle}>GL Code Totals</Text>
        <View style={styles.glSummaryTable}>
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: "50%" }]}>
              <Text>GL Code</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "50%" }]}>
              <Text>Total Amount</Text>
            </View>
          </View>
          {glSummary.map(([glCode, amount]) => (
            <View style={styles.tableRow} key={glCode}>
              <View style={[styles.tableCol, { width: "50%" }]}>
                <Text>{glCode}</Text>
              </View>
              <View
                style={[styles.tableCol, styles.colAmount, { width: "50%" }]}
              >
                <Text>{formatCurrency(amount)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Transaction Table */}
        <Text style={styles.sectionTitle}>Transactions</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, styles.colApproved]}>
              <Text>Approved</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colDate]}>
              <Text>Transaction Date / Posting Date</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colAmount]}>
              <Text>Amount</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colLineAmount]}>
              <Text>Line Amount</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colGlCode]}>
              <Text>GL Code</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colGlDescription]}>
              <Text>GL Description</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colReason]}>
              <Text>Reason</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colReceiptId]}>
              <Text>Receipt ID</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colSupplier]}>
              <Text>Supplier</Text>
            </View>
          </View>
          {transactions.map((tx, i) => (
            <View style={styles.tableRow} key={i}>
              {/* Approved Status */}
              <View style={[styles.tableCol, styles.colApproved]}>
                <Text
                  style={
                    tx.workflowStatus === "Approved"
                      ? styles.checkmark
                      : styles.xmark
                  }
                >
                  {tx.workflowStatus === "Approved" ? "✓" : "✗"}
                </Text>
              </View>

              {/* Transaction Date / Posting Date */}
              <View style={[styles.tableCol, styles.colDate]}>
                <Text style={{ fontWeight: "bold" }}>
                  {formatDate(tx.transactionDate)}
                </Text>
                <Text>{formatDate(tx.postingDate)}</Text>
              </View>

              {/* Billing Amount */}
              <View style={[styles.tableCol, styles.colAmount]}>
                <Text>{formatCurrency(tx.billingAmount)}</Text>
              </View>

              {/* Line Amount */}
              <View style={[styles.tableCol, styles.colLineAmount]}>
                <Text>
                  Line {tx.lineNumber}: {formatCurrency(tx.lineAmount)}
                </Text>
              </View>

              {/* GL Code */}
              <View style={[styles.tableCol, styles.colGlCode]}>
                <Text>{tx.glCode}</Text>
              </View>

              {/* GL Code Description */}
              <View style={[styles.tableCol, styles.colGlDescription]}>
                <Text>{tx.glCodeDescription}</Text>
              </View>

              {/* Reason for Expense */}
              <View style={[styles.tableCol, styles.colReason]}>
                <Text>{tx.reasonForExpense}</Text>
              </View>

              {/* Receipt Image Reference ID */}
              <View style={[styles.tableCol, styles.colReceiptId]}>
                <Text>{tx.receiptImageReferenceId}</Text>
              </View>

              {/* Supplier */}
              <View style={[styles.tableCol, styles.colSupplier]}>
                <Text>{tx.supplierName}</Text>
                <Text>
                  {tx.supplierCity}, {tx.supplierState}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.total}>Total: {formatCurrency(total)}</Text>
      </Page>
    </Document>
  );
}
