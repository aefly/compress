import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Uses SI units (1 KB = 1000 bytes) to match what OS file managers display.
export function formatSize(bytes: number): string {
  if (bytes < 1000) return `${bytes} B`
  if (bytes < 1000 * 1000) return `${(bytes / 1000).toFixed(1)} KB`
  return `${(bytes / (1000 * 1000)).toFixed(2)} MB`
}

export function truncateName(name: string, max: number = 30): string {
  if (name.length <= max) return name
  return name.slice(0, max) + "..."
}
