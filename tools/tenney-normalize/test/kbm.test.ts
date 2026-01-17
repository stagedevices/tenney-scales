import { describe, expect, it } from "vitest";
import { generateMinimalKbm, parseKbm } from "../src/kbm.js";

const sample = `! KBM example
12
0
127
60
69
440.0
12
`;

describe("parseKbm", () => {
  it("parses numeric lines", () => {
    const parsed = parseKbm(sample);
    expect(parsed.mapSize).toBe(12);
    expect(parsed.referenceFrequency).toBe(440);
    expect(parsed.octaveDegree).toBe(12);
  });
});

describe("generateMinimalKbm", () => {
  it("creates a minimal KBM", () => {
    const content = generateMinimalKbm(432, 13);
    expect(content).toContain("432");
    expect(content.split("\n")[6]).toBe("13");
  });
});
