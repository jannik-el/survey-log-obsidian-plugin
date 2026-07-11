/**
 * Pure time helpers for the entry modal. Times are modeled as
 * minutes-of-day (0..1439) so arrow-key stepping and midnight
 * wrapping are simple integer math.
 */

export type TimezoneMode = "utc" | "local";

export const MINUTES_PER_DAY = 24 * 60;

export function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

/** Minutes-of-day for the given date, read in the given timezone mode. */
export function minutesOfDay(date: Date, mode: TimezoneMode): number {
  return mode === "utc"
    ? date.getUTCHours() * 60 + date.getUTCMinutes()
    : date.getHours() * 60 + date.getMinutes();
}

/** Format minutes-of-day as "HH:mm". Values outside 0..1439 are wrapped. */
export function formatMinutes(minutes: number): string {
  const m = ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`;
}

/**
 * Parse "HH:mm" (or "H:mm") into minutes-of-day.
 * Returns null for anything that is not a valid 24h time.
 */
export function parseTimeText(text: string): number | null {
  const match = /^\s*(\d{1,2}):(\d{2})\s*$/.exec(text);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
}

/** Step minutes-of-day by delta, wrapping across midnight in both directions. */
export function stepMinutes(minutes: number, delta: number): number {
  return (((minutes + delta) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
}

/** Timestamp as inserted into an entry line: "HH:mm" plus "Z" in UTC mode. */
export function formatTimestamp(minutes: number, mode: TimezoneMode): string {
  const base = formatMinutes(minutes);
  return mode === "utc" ? `${base}Z` : base;
}
