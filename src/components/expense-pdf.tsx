import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

interface Transaction {
  transactionDate: string;
  supplierName: string;
  glCode: string;
  billingAmount: number;
}

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
    fontSize: 22,
    marginBottom: 12,
    textAlign: "center",
    fontWeight: "bold",
  },
  meta: {
    marginBottom: 16,
    fontSize: 11,
  },
  metaRow: {
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 14,
    marginTop: 18,
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
    marginBottom: 12,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableColAmount: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    textAlign: "right",
    // monospace caused rendering issues because it wasn't a registered font
    fontFamily: "Courier",
  },
  total: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "right",
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
      <Page size="A4" style={styles.page}>
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
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text>GL Code</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>Total Billing Amount</Text>
            </View>
            <View style={styles.tableColHeader}></View>
            <View style={styles.tableColHeader}></View>
          </View>
          {glSummary.map(([glCode, amount]) => (
            <View style={styles.tableRow} key={glCode}>
              <View style={styles.tableCol}>
                <Text>{glCode}</Text>
              </View>
              <View style={styles.tableColAmount}>
                <Text>
                  {Number(amount).toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </Text>
              </View>
              <View style={styles.tableCol}></View>
              <View style={styles.tableCol}></View>
            </View>
          ))}
        </View>

        {/* Transaction Table */}
        <Text style={styles.sectionTitle}>Transactions</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text>Date</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>Supplier</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>GL Code</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>Amount</Text>
            </View>
          </View>
          {transactions.map((tx, i) => (
            <View style={styles.tableRow} key={i}>
              <View style={styles.tableCol}>
                <Text>{tx.transactionDate}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text>{tx.supplierName}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text>{tx.glCode}</Text>
              </View>
              <View style={styles.tableColAmount}>
                <Text>
                  {Number(tx.billingAmount).toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <Text style={styles.total}>
          Total:{" "}
          {total.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}
        </Text>
      </Page>
    </Document>
  );
}
