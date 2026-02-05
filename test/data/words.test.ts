import { describe, it, expect } from "vitest";
import { WORDS } from "../../src/data/words.js";

describe("WORDS data", () => {
  it("has no duplicate words", () => {
    const wordSet = new Set(WORDS.map((w) => w.word));
    expect(wordSet.size).toBe(WORDS.length);
  });

  it("all words are lowercase", () => {
    for (const entry of WORDS) {
      expect(entry.word).toBe(entry.word.toLowerCase());
    }
  });

  it("all entries have non-empty descriptions", () => {
    for (const entry of WORDS) {
      expect(entry.description.length).toBeGreaterThan(0);
    }
  });

  it("has at least 100 words", () => {
    expect(WORDS.length).toBeGreaterThanOrEqual(100);
  });

  it("all words are between 3 and 7 characters", () => {
    for (const entry of WORDS) {
      expect(entry.word.length).toBeGreaterThanOrEqual(3);
      expect(entry.word.length).toBeLessThanOrEqual(7);
    }
  });
});
