import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'id_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

export function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
}

/**
 * Calculate remaining days for an item in the Recycle Bin (10-day retention policy)
 */
export function getRemainingTrashDays(trashedAt?: string): { daysLeft: number; isExpired: boolean; formattedDate: string } {
  if (!trashedAt) {
    return { daysLeft: 10, isExpired: false, formattedDate: 'Recently' };
  }
  const trashedDate = new Date(trashedAt);
  const elapsedMs = Date.now() - trashedDate.getTime();
  const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;
  const remainingMs = TEN_DAYS_MS - elapsedMs;
  const daysLeft = Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));

  const formattedDate = trashedDate.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });

  return {
    daysLeft,
    isExpired: remainingMs <= 0,
    formattedDate,
  };
}
