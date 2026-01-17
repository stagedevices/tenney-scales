import { describe, expect, it } from "vitest";
import { formatISO8601NoMillis, normalizeISO8601NoMillis } from "../src/utils.js";

describe("formatISO8601NoMillis", () => {
  it("removes fractional seconds from ISO strings", () => {
    const value = new Date("2026-01-01T00:00:00.000Z");
    expect(formatISO8601NoMillis(value)).toBe("2026-01-01T00:00:00Z");
  });
});

describe("normalizeISO8601NoMillis", () => {
  it("normalizes valid ISO strings without milliseconds", () => {
    expect(normalizeISO8601NoMillis("2026-01-01T00:00:00.000Z")).toBe(
      "2026-01-01T00:00:00Z"
    );
  });

  it("throws on invalid input", () => {
    expect(() => normalizeISO8601NoMillis("not-a-date")).toThrow(
      "Invalid ISO8601 date string"
    );
  });
});
