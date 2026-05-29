import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getErrorMessage = (err: unknown) =>
  err ? (err instanceof Error ? err.message : "Something went wrong") : null;

export const getDisplayPrice = (price: number): number => {
  return price / 100;
};
