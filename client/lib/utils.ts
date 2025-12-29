import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getOrderNumber(saleId: string): string {
  // Generate a consistent order number from the sale ID
  // Extract first 8 characters and convert to a number
  const hash = saleId.substring(0, 8);
  let num = 0;
  for (let i = 0; i < hash.length; i++) {
    num += hash.charCodeAt(i);
  }
  // Map to a 3-digit number (001-999)
  const orderNum = (num % 999) + 1;
  return `DL-${orderNum.toString().padStart(3, "0")}`;
}
