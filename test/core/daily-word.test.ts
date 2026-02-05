import { describe, it, expect } from "vitest";
import {
  getBerlinDateString,
  daysSinceReference,
  getDailyWord,
} from "../../src/core/daily-word.js";
import type { WordEntry } from "../../src/core/types.js";

const TEST_WORDS: WordEntry[] = [
  { word: "alpha", description: "First" },
  { word: "bravo", description: "Second" },
  { word: "charlie", description: "Third" },
];

describe("getBerlinDateString", () => {
  it("returns YYYY-MM-DD format", () => {
    const result = getBerlinDateString(new Date("2026-06-15T12:00:00Z"));
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("respects Berlin timezone in winter (CET, UTC+1)", () => {
    // 2026-01-15T23:30:00Z = 2026-01-16T00:30:00 in Berlin
    const result = getBerlinDateString(new Date("2026-01-15T23:30:00Z"));
    expect(result).toBe("2026-01-16");
  });

  it("respects Berlin timezone in summer (CEST, UTC+2)", () => {
    // 2026-07-15T22:30:00Z = 2026-07-16T00:30:00 in Berlin
    const result = getBerlinDateString(new Date("2026-07-15T22:30:00Z"));
    expect(result).toBe("2026-07-16");
  });
});

describe("daysSinceReference", () => {
  it("returns 0 for reference date", () => {
    expect(daysSinceReference("2026-01-01")).toBe(0);
  });

  it("returns correct positive days", () => {
    expect(daysSinceReference("2026-01-02")).toBe(1);
    expect(daysSinceReference("2026-02-01")).toBe(31);
  });

  it("returns negative for dates before reference", () => {
    expect(daysSinceReference("2025-12-31")).toBe(-1);
  });
});

describe("getDailyWord", () => {
  it("returns correct word for reference date", () => {
    const result = getDailyWord(TEST_WORDS, new Date("2026-01-01T12:00:00Z"));
    expect(result.word).toBe("alpha");
    expect(result.description).toBe("First");
    expect(result.date).toBe("2026-01-01");
  });

  it("cycles through all words", () => {
    const words = new Set<string>();
    for (let day = 0; day < TEST_WORDS.length; day++) {
      const date = new Date(
        `2026-01-${String(day + 1).padStart(2, "0")}T12:00:00Z`,
      );
      const result = getDailyWord(TEST_WORDS, date);
      words.add(result.word);
    }
    expect(words.size).toBe(TEST_WORDS.length);
  });

  it("wraps around after exhausting all words", () => {
    const day0 = getDailyWord(TEST_WORDS, new Date("2026-01-01T12:00:00Z"));
    const day3 = getDailyWord(TEST_WORDS, new Date("2026-01-04T12:00:00Z"));
    expect(day3.word).toBe(day0.word);
  });

  it("returns same word regardless of time of day in Berlin timezone", () => {
    const morning = getDailyWord(
      TEST_WORDS,
      new Date("2026-01-15T06:00:00Z"),
    );
    const evening = getDailyWord(
      TEST_WORDS,
      new Date("2026-01-15T20:00:00Z"),
    );
    expect(morning.word).toBe(evening.word);
    expect(morning.date).toBe(evening.date);
  });

  it("switches word at midnight Berlin time", () => {
    // 2026-01-15T22:59:00Z = 2026-01-15T23:59:00 CET (still Jan 15 in Berlin)
    const beforeMidnight = getDailyWord(
      TEST_WORDS,
      new Date("2026-01-15T22:59:00Z"),
    );
    // 2026-01-15T23:01:00Z = 2026-01-16T00:01:00 CET (now Jan 16 in Berlin)
    const afterMidnight = getDailyWord(
      TEST_WORDS,
      new Date("2026-01-15T23:01:00Z"),
    );
    expect(beforeMidnight.date).toBe("2026-01-15");
    expect(afterMidnight.date).toBe("2026-01-16");
    expect(beforeMidnight.word).not.toBe(afterMidnight.word);
  });

  it("handles dates before reference date", () => {
    const result = getDailyWord(TEST_WORDS, new Date("2025-12-31T12:00:00Z"));
    expect(result.date).toBe("2025-12-31");
    expect(TEST_WORDS.map((w) => w.word)).toContain(result.word);
  });
});
