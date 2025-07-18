import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value)
}

export const formatDateStringToLocal = (dateStr: string, locale: string = "en-US") => {
  const date = new Date(dateStr);

  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  }

  const formatter = new Intl.DateTimeFormat(locale, options);

  return formatter.format(date);
}

export function cleanName(name: string): string {
  // Remove special characters, spaces, and convert to lowercase
  return name ? name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() : "";
}