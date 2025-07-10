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
    fontSize: 10,
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
    width: "95%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 10,
  },
  glSummaryTable: {
    display: "flex",
    width: "70%",
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
    textAlign: "center",
    fontSize: 10,
  },
  tableCol: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 2,
    textAlign: "center",
    fontSize: 10,
  },
  // Column widths for the new table structure
  colApproved: { width: "8%", textAlign: "center" },
  colDate: { width: "12%", textAlign: "center" },
  colAmount: { width: "10%", textAlign: "right" },
  colLineAmount: { width: "10%", textAlign: "right" },
  colGlCode: { width: "8%", textAlign: "center" },
  colGlDescription: { width: "15%", textAlign: "center" },
  colReason: { width: "15%", textAlign: "center" },
  colReceiptId: { width: "10%", textAlign: "center" },
  colSupplier: { width: "12%", textAlign: "center" },

  total: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "right",
    paddingRight: 10,
  },
  totalRow: {
    flexDirection: "row",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f8f8f8",
  },
  totalLabel: {
    width: "33.33%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 2,
    textAlign: "center",
    fontWeight: "bold",
  },
  totalAmount: {
    width: "66.67%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 2,
    textAlign: "right",
    fontWeight: "bold",
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
    if (!acc[tx.glCode]) {
      acc[tx.glCode] = { total: 0, count: 0 };
    }
    acc[tx.glCode].total += Number(tx.billingAmount) || 0;
    acc[tx.glCode].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);
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

// Header component to be reused on both pages
function ReportHeader({
  cardHolderName,
  lastFourDigits,
  statementPeriodStartDate,
  statementPeriodEndDate,
  total,
}: {
  cardHolderName: string;
  lastFourDigits: string;
  statementPeriodStartDate: string;
  statementPeriodEndDate: string;
  total: number;
}) {
  return (
    <>
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
        <Text style={styles.metaRow}>
          <Text style={{ fontWeight: "bold" }}>Total Amount:</Text>{" "}
          {formatCurrency(total)}
        </Text>
      </View>
    </>
  );
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
      {/* First Page - Header and Transactions */}
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <ReportHeader
          cardHolderName={cardHolderName}
          lastFourDigits={lastFourDigits}
          statementPeriodStartDate={statementPeriodStartDate}
          statementPeriodEndDate={statementPeriodEndDate}
          total={total}
        />

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
            <View style={[styles.tableColHeader, styles.colSupplier]}>
              <Text>Supplier</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colGlCode]}>
              <Text>GL Code</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colGlDescription]}>
              <Text>GL Description</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colReason]}>
              <Text>Reason for Expense</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colReceiptId]}>
              <Text>Receipt ID</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colLineAmount]}>
              <Text>Line Amount</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colAmount]}>
              <Text>Amount</Text>
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
                      : tx.workflowStatus === "Approval Required"
                      ? styles.xmark
                      : { textAlign: "center" }
                  }
                >
                  {tx.workflowStatus === "Approved"
                    ? "Yes"
                    : tx.workflowStatus === "Approval Required"
                    ? "No"
                    : tx.workflowStatus || "-"}
                </Text>
              </View>

              {/* Transaction Date / Posting Date */}
              <View style={[styles.tableCol, styles.colDate]}>
                <Text style={{ fontWeight: "bold" }}>
                  {formatDate(tx.transactionDate)}
                </Text>
                <Text>{formatDate(tx.postingDate)}</Text>
              </View>

              {/* Supplier */}
              <View style={[styles.tableCol, styles.colSupplier]}>
                <Text>{tx.supplierName}</Text>
                <Text>
                  {tx.supplierCity}, {tx.supplierState}
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

              {/* Line Amount */}
              <View style={[styles.tableCol, styles.colLineAmount]}>
                <Text>
                  Line {tx.lineNumber}: {formatCurrency(tx.lineAmount)}
                </Text>
              </View>

              {/* Billing Amount */}
              <View style={[styles.tableCol, styles.colAmount]}>
                <Text>{formatCurrency(tx.billingAmount)}</Text>
              </View>
            </View>
          ))}
        </View>
      </Page>

      {/* Second Page - GL Code Summary */}
      <Page size="A4" orientation="landscape" style={styles.page}>
        <ReportHeader
          cardHolderName={cardHolderName}
          lastFourDigits={lastFourDigits}
          statementPeriodStartDate={statementPeriodStartDate}
          statementPeriodEndDate={statementPeriodEndDate}
          total={total}
        />

        <Text style={styles.sectionTitle}>GL Code Totals</Text>
        <View style={styles.glSummaryTable}>
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: "33.33%" }]}>
              <Text>GL Code</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "33.33%" }]}>
              <Text>Transaction Count</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "33.34%" }]}>
              <Text>Total Amount</Text>
            </View>
          </View>
          {glSummary.map(([glCode, data]) => (
            <View style={styles.tableRow} key={glCode}>
              <View style={[styles.tableCol, { width: "33.33%" }]}>
                <Text>{glCode}</Text>
              </View>
              <View style={[styles.tableCol, { width: "33.33%" }]}>
                <Text>{data.count}</Text>
              </View>
              <View
                style={[styles.tableCol, styles.colAmount, { width: "33.34%" }]}
              >
                <Text>{formatCurrency(data.total)}</Text>
              </View>
            </View>
          ))}
          {/* Total Row */}
          <View style={styles.totalRow}>
            <View style={styles.totalLabel}>
              <Text>Total</Text>
            </View>
            <View style={styles.totalAmount}>
              <Text>{formatCurrency(total)}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
