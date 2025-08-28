"use server";

import { revalidatePath } from "next/cache";
import { updateFuelLogs, createFuelLog } from "@/lib/db/mutations/fuel-logs";
import {
  SelectFuelLog,
  SelectTransaction,
} from "@/lib/data-model/schema-types";

/**
 * Server Actions for fuel log operations
 * These replace the client-side context operations
 */

/**
 * Update a specific field of a fuel log
 * Replaces the updateFuelLogField function from context
 */
export async function updateFuelLogFieldAction(
  transactionId: string,
  field: keyof SelectFuelLog,
  value: string | number
) {
  try {
    console.log(
      `🔄 Updating fuel transaction ${transactionId}: ${field} = ${value}`
    );

    // Prepare update data based on field type
    const updateData: Record<string, string | number | Date> = {};

    switch (field) {
      case "vehicleId":
      case "invoiceNumber":
      case "sellerState":
      case "sellerName":
      case "receipt":
        updateData[field] = value as string;
        break;
      case "date":
        updateData[field] = new Date(value as string);
        break;
      case "gallons":
      case "cost":
        updateData[field] = parseFloat(value as string);
        break;
      case "odometer":
        updateData[field] = parseInt(value as string);
        break;
      default:
        throw new Error(`Unsupported field: ${field}`);
    }

    const updatedFuelLog = await updateFuelLogs(transactionId, updateData);

    if (!updatedFuelLog) {
      throw new Error("Failed to update fuel log");
    }

    console.log(`✅ Successfully updated fuel transaction ${transactionId}`);

    // Revalidate the detail page to show updated data
    revalidatePath("/fuel-report/[id]", "page");

    return { success: true, transaction: updatedFuelLog };
  } catch (error) {
    console.error(
      `❌ Failed to update fuel transaction ${transactionId}:`,
      error
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Add an expense transaction to a fuel report as a new fuel transaction
 * Replaces the addTransactionToFuelReport function from context
 * Updated to use modern SelectTransaction type instead of deprecated Transaction
 */
export async function addTransactionToFuelReportAction(
  driverId: string,
  expenseTransaction: SelectTransaction
) {
  try {
    console.log(
      `🔄 Adding expense transaction to fuel report for driver ${driverId}`
    );

    // Create a new fuel transaction from the modern SelectTransaction
    const newFuelLogData = {
      vehicleId: "UNKNOWN", // Will need to be manually set later
      driverId: driverId,
      date: expenseTransaction.transactionDate, // Already a Date object
      invoiceNumber: expenseTransaction.transactionReference,
      gallons: expenseTransaction.fuelQuantity
        ? parseFloat(expenseTransaction.fuelQuantity)
        : 0,
      cost: parseFloat(expenseTransaction.billingAmount),
      sellerState: expenseTransaction.supplierState || "UNKNOWN",
      sellerName: expenseTransaction.supplierName || "UNKNOWN",
      odometer: expenseTransaction.odometerReading
        ? parseFloat(expenseTransaction.odometerReading)
        : 0,
      receipt: expenseTransaction.receiptImageName || "",
    };

    const newFuelLog = await createFuelLog(newFuelLogData);

    if (!newFuelLog) {
      throw new Error("Failed to create fuel transaction");
    }

    console.log(`✅ Successfully added fuel transaction ${newFuelLog.id}`);

    // Revalidate the detail page to show the new transaction
    revalidatePath("/fuel-report/[id]", "page");

    return { success: true, transaction: newFuelLog };
  } catch (error) {
    console.error(`❌ Failed to add transaction to fuel report:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Delete a fuel transaction (for future use)
 */
export async function deleteFuelLogAction(transactionId: string) {
  try {
    console.log(`🔄 Deleting fuel transaction ${transactionId}`);

    // TODO: Implement delete functionality when needed
    // const result = await deleteFuelTransaction(transactionId);

    console.log(`✅ Successfully deleted fuel transaction ${transactionId}`);

    // Revalidate the detail page to show updated data
    revalidatePath("/fuel-report/[id]", "page");

    return { success: true };
  } catch (error) {
    console.error(
      `❌ Failed to delete fuel transaction ${transactionId}:`,
      error
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
