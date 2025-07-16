export const ExpenseReportRoute ={
    label: "Expense Report",
    detailPage: (id: string) => `/expense_report/${id}`,
}

export const FuelReportRoute = {
    label: "Fuel Report",
    summaryPage: "/fuel-report",
    detailPage: (id: string) => `/fuel-report/${id}`,
}