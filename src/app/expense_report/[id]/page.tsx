"use client"
import { useStatements } from "@/components/data-context"
import React from "react"

interface ExpenseReportPageProps {
    params: {
        id: string
    }
}

export default function ExpenseReportPage({ params }: ExpenseReportPageProps) {

    // use id to get transactions 
    // modify context to set current statement 
    // use context to show current statement 
    const { selectedStatement } = useStatements()

    // const { id } = React.use(params)

    return ( 
        <div>
            {selectedStatement ? (
                <div>
                    {selectedStatement.cardHolderName} - {selectedStatement.lastFourDigits} - {selectedStatement.statementPeriodStartDate} - {selectedStatement.statementPeriodEndDate}
                </div>
            )
            : (
                <div>
                    No statement selected
                </div>
            )
        }
        </div>
    )
}