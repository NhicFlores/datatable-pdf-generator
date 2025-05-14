"use server"
import { getCsvData } from "./read-csv";

export async function getStatements(){
    const transactions = await getCsvData();

    const statements = transactions.map((transaction) => ({
        statementPeriodStartDate: transaction.statementPeriodStartDate,
        statementPeriodEndDate: transaction.statementPeriodEndDate,
        lastFourDigits: transaction.lastFourDigits,
        cardHolderName: transaction.cardHolderName,
        totalAmount: transaction.billingAmount,
    }));

    return statements;
}

export async function getTransactions(){
    const transactions = await getCsvData();

    return transactions.map((transaction) => ({
        cardholderName: transaction.cardHolderName,
        lastFourDigits: transaction.lastFourDigits,
        transactionDate: transaction.transactionDate,
        postingDate: transaction.postingDate,
        billingAmount: transaction.billingAmount,
        lineAmount: transaction.lineAmount,
        lineNumber: transaction.lineNumber,
        glCode: transaction.glCode,
        glCodeDescription: transaction.glCodeDescription,
        reasonForExpense: transaction.reasonForExpense,
        receiptImageName: transaction.receiptImageName,
        receiptImageReferenceId: transaction.receiptImageReferenceId,
        supplierName: transaction.supplierName,
        supplierCity: transaction.supplierCity,
        supplierState: transaction.supplierState,
        workflowStatus: transaction.workflowStatus
    }));
}