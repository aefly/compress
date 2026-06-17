import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/** Merges Tailwind classes with proper conflict resolution (e.g. p-4 + p-8 → p-8) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formats bytes as a human-readable SI string (1 KB = 1000 bytes) */
export function formatSize(bytes: number): string {
  if (bytes < 1000) return `${bytes} B`
  if (bytes < 1000 * 1000) return `${(bytes / 1000).toFixed(1)} KB`
  return `${(bytes / (1000 * 1000)).toFixed(2)} MB`
}

/** Truncates a filename to `max` characters, appending "…" if shortened */
export function truncateName(name: string, max: number = 30): string {
  if (name.length <= max) return name
  return name.slice(0, max) + "..."
}