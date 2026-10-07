import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** The one reveal easing used across the site. */
export const EASE = [0.22, 1, 0.36, 1] as const;
