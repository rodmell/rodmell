import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatThousands(value: string | number): string {
  if (value === undefined || value === null || value === "") return "";
  const numStr = String(value).replace(/\D/g, "");
  if (!numStr) return "";
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function parseThousands(value: string | number): number {
  if (value === undefined || value === null || value === "") return 0;
  if (typeof value === "number") return value;
  const clean = value.replace(/\./g, "");
  return parseFloat(clean) || 0;
}
