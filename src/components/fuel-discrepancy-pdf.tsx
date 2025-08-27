// DEPRECATED OR REFACTOR
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { FuelExpenseDiscrepancy } from "@/lib/data-model/DEPRECATED-TYPES";

interface FuelDiscrepancyPDFProps {
  discrepancies: FuelExpenseDiscrepancy[];
  generatedDate: string;
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
  subtitle: {
    fontSize: 14,
    marginBottom: 15,
    textAlign: "center",
    color: "#666",
  },
  meta: {
    marginBottom: 20,
    fontSize: 10,
    textAlign: "center",
  },
  driverSection: {
    marginBottom: 20,
  },
  driverHeader: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    backgroundColor: "#f0f0f0",
    padding: 5,
    textAlign: "center",
  },
  table: {
    display: "flex",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 15,
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
    padding: 3,
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 9,
  },
  tableCol: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 3,
    textAlign: "center",
    fontSize: 9,
  },
  // Column widths
  colDate: { width: "12%", textAlign: "center" },
  colSupplier: { width: "20%", textAlign: "center" },
  colGlCode: { width: "12%", textAlign: "center" },
  colGlDescription: { width: "18%", textAlign: "center" },
  colReason: { width: "18%", textAlign: "center" },
  colAmount: { width: "12%", textAlign: "right" },
  colStatus: { width: "8%", textAlign: "center" },

  summary: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 5,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
  },
  summaryText: {
    fontSize: 10,
    marginBottom: 2,
  },
  noDiscrepancies: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    marginTop: 50,
  },
});

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
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

export function FuelDiscrepancyPDF({
  discrepancies,
  generatedDate,
}: FuelDiscrepancyPDFProps) {
  const totalDiscrepancies = discrepancies.reduce(
    (sum, discrepancy) => sum + discrepancy.Transactions.length,
    0
  );

  const totalAmount = discrepancies.reduce(
    (sum, discrepancy) =>
      sum +
      discrepancy.Transactions.reduce(
        (driverSum, tx) => driverSum + Number(tx.billingAmount || 0),
        0
      ),
    0
  );

  if (discrepancies.length === 0) {
    return (
      <Document>
        <Page size="A4" orientation="landscape" style={styles.page}>
          <Text style={styles.title}>Fuel Expense Discrepancy Report</Text>
          <Text style={styles.subtitle}>
            Generated on {formatDate(generatedDate)}
          </Text>
          <Text style={styles.noDiscrepancies}>
            No fuel expense discrepancies found.
          </Text>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>Fuel Expense Discrepancy Report</Text>
        <Text style={styles.subtitle}>
          Generated on {formatDate(generatedDate)}
        </Text>

        <View style={styles.meta}>
          <Text>
            Total Drivers with Discrepancies: {discrepancies.length} | Total
            Missing Transactions: {totalDiscrepancies} | Total Amount:{" "}
            {formatCurrency(totalAmount)}
          </Text>
        </View>

        {discrepancies.map((discrepancy, index) => (
          <View key={index} style={styles.driverSection}>
            <Text style={styles.driverHeader}>
              {discrepancy.driver} - {discrepancy.Transactions.length} Missing
              Transaction{discrepancy.Transactions.length !== 1 ? "s" : ""}
            </Text>

            <View style={styles.table}>
              <View style={styles.tableRow}>
                <View style={[styles.tableColHeader, styles.colDate]}>
                  <Text>Date</Text>
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
                  <Text>Reason</Text>
                </View>
                <View style={[styles.tableColHeader, styles.colAmount]}>
                  <Text>Amount</Text>
                </View>
                <View style={[styles.tableColHeader, styles.colStatus]}>
                  <Text>Status</Text>
                </View>
              </View>

              {discrepancy.Transactions.map((tx, txIndex) => (
                <View style={styles.tableRow} key={txIndex}>
                  <View style={[styles.tableCol, styles.colDate]}>
                    <Text>{formatDate(tx.transactionDate)}</Text>
                  </View>
                  <View style={[styles.tableCol, styles.colSupplier]}>
                    <Text>{tx.supplierName}</Text>
                  </View>
                  <View style={[styles.tableCol, styles.colGlCode]}>
                    <Text>{tx.glCode}</Text>
                  </View>
                  <View style={[styles.tableCol, styles.colGlDescription]}>
                    <Text>{tx.glCodeDescription}</Text>
                  </View>
                  <View style={[styles.tableCol, styles.colReason]}>
                    <Text>{tx.reasonForExpense}</Text>
                  </View>
                  <View style={[styles.tableCol, styles.colAmount]}>
                    <Text>{formatCurrency(tx.billingAmount)}</Text>
                  </View>
                  <View style={[styles.tableCol, styles.colStatus]}>
                    <Text>{tx.workflowStatus}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <Text style={styles.summaryText}>
            Total Drivers with Discrepancies: {discrepancies.length}
          </Text>
          <Text style={styles.summaryText}>
            Total Missing Transactions: {totalDiscrepancies}
          </Text>
          <Text style={styles.summaryText}>
            Total Amount of Missing Transactions: {formatCurrency(totalAmount)}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
