import { db } from "@/drizzle";
import { drivers } from "@/drizzle/schema";
import { SelectDriver } from "@/lib/data-model/schema-types";

export async function getAllDrivers(): Promise<{
    success: boolean; 
    drivers: SelectDriver[]; 
    error?: string}>
    {
    try {
        const allDrivers = await db.select().from(drivers);
        return { success: true, drivers: allDrivers };
    } catch (error) {
        console.error("Error fetching drivers:", error);
        return { success: false, drivers: [], error: "Error fetching drivers" };
    }
}