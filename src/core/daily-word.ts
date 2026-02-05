import type { WordEntry, DailyWordResponse } from "./types.js";

const REFERENCE_DATE = "2026-01-01";

/**
 * Returns the current date string in Europe/Berlin timezone.
 * Uses "en-CA" locale which formats as YYYY-MM-DD.
 */
export function getBerlinDateString(now: Date = new Date()): string {
  return now.toLocaleDateString("en-CA", { timeZone: "Europe/Berlin" });
}

/**
 * Calculates the number of days between the reference date and the given date string.
 */
export function daysSinceReference(dateString: string): number {
  const ref = new Date(REFERENCE_DATE + "T00:00:00Z");
  const current = new Date(dateString + "T00:00:00Z");
  const diffMs = current.getTime() - ref.getTime();
  return Math.floor(diffMs / (24 * 60 * 60 * 1000));
}

/**
 * Selects the daily word deterministically based on the current date in Berlin timezone.
 */
export function getDailyWord(
  words: WordEntry[],
  now: Date = new Date(),
): DailyWordResponse {
  const dateString = getBerlinDateString(now);
  const dayIndex = daysSinceReference(dateString);
  const wordIndex = ((dayIndex % words.length) + words.length) % words.length;

  const entry = words[wordIndex];
  return {
    word: entry.word,
    description: entry.description,
    date: dateString,
  };
}
