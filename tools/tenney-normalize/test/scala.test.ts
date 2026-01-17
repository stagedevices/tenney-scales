import { describe, expect, it } from "vitest";
import { parseScala } from "../src/scala.js";

const sample = `! Example scale
! Another comment
Example Scale
3
100.0
3/2
1200.0
`;

describe("parseScala", () => {
  it("parses description, degrees, and comments", () => {
    const parsed = parseScala(sample);
    expect(parsed.description).toBe("Example Scale");
    expect(parsed.degreeCount).toBe(3);
    expect(parsed.comments).toEqual(["Example scale", "Another comment"]);
    expect(parsed.degrees[0]).toEqual({ type: "cents", cents: 100, source: "100.0" });
    expect(parsed.degrees[1]).toEqual({ type: "ratio", p: 3, q: 2, source: "3/2" });
    expect(parsed.degrees[2]).toEqual({ type: "cents", cents: 1200, source: "1200.0" });
  });
});
