import { describe, expect, it } from "vitest";
import { approximateCents } from "../src/approx.js";
import { foldToOctave, ratioToMonzoWithOctave } from "../src/ratio.js";


describe("approximateCents", () => {
  it("approximates 700 cents to 3/2", () => {
    const result = approximateCents(700, 7);
    expect(result.ratio).toEqual({ n: 3, d: 2 });
  });

  it("respects prime limit when possible", () => {
    const result = approximateCents(386.3137, 5);
    expect(result.ratio).toEqual({ n: 5, d: 4 });
  });
});

describe("foldToOctave", () => {
  it("folds ratios into [1,2)", () => {
    const folded = foldToOctave({ n: 5, d: 2 });
    expect(folded).toEqual({ p: 5, q: 4, octave: 1 });
  });
});

describe("ratioToMonzoWithOctave", () => {
  it("includes octave exponent in monzo", () => {
    const monzo = ratioToMonzoWithOctave(3, 2, 1);
    expect(monzo).toEqual({ "3": 1 });
  });

  it("keeps prime 2 exponent when needed", () => {
    const monzo = ratioToMonzoWithOctave(5, 4, 1);
    expect(monzo).toEqual({ "2": -1, "5": 1 });
  });
});
