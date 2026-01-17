import { assertNumber } from "./utils.js";
import type { ParsedScala, ScalaDegree } from "./types.js";

function isComment(line: string): boolean {
  return line.trim().startsWith("!");
}

function isBlank(line: string): boolean {
  return line.trim().length === 0;
}

export function parseScala(content: string): ParsedScala {
  const lines = content.split(/\r?\n/);
  const comments: string[] = [];
  const tokens: string[] = [];
  for (const line of lines) {
    if (isBlank(line)) {
      continue;
    }
    if (isComment(line)) {
      comments.push(line.replace(/^\s*!\s?/, "").trim());
      continue;
    }
    tokens.push(line.trim());
  }

  if (tokens.length < 2) {
    throw new Error("Scala file must include a description and degree count.");
  }

  const description = tokens[0];
  const degreeCount = assertNumber(Number.parseInt(tokens[1], 10), "degreeCount");
  if (!Number.isFinite(degreeCount) || degreeCount <= 0) {
    throw new Error("Scala degree count must be a positive integer.");
  }

  const degreeLines = tokens.slice(2, 2 + degreeCount);
  if (degreeLines.length < degreeCount) {
    throw new Error("Scala file does not include enough degrees.");
  }

  const degrees: ScalaDegree[] = degreeLines.map((line) => parseDegree(line));

  return {
    description,
    degreeCount,
    degrees,
    comments
  };
}

function parseDegree(line: string): ScalaDegree {
  const token = line.split(/\s+/)[0];
  if (token.includes("/")) {
    const [pRaw, qRaw] = token.split("/");
    const p = assertNumber(Number.parseInt(pRaw, 10), "ratio numerator");
    const q = assertNumber(Number.parseInt(qRaw, 10), "ratio denominator");
    if (!Number.isFinite(p) || !Number.isFinite(q) || q === 0) {
      throw new Error(`Invalid ratio degree: ${token}`);
    }
    return { type: "ratio", p, q, source: token };
  }
  const cents = assertNumber(Number.parseFloat(token), "cents");
  if (!Number.isFinite(cents)) {
    throw new Error(`Invalid cents degree: ${token}`);
  }
  return { type: "cents", cents, source: token };
}
