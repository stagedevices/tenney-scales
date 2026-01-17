import { assertNumber } from "./utils.js";
import type { ParsedKbm } from "./types.js";

function isComment(line: string): boolean {
  return line.trim().startsWith("!");
}

export function parseKbm(content: string): ParsedKbm {
  const lines = content.split(/\r?\n/);
  const numericLines: string[] = [];
  const rawLines: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length === 0) {
      continue;
    }
    if (isComment(trimmed)) {
      continue;
    }
    rawLines.push(trimmed);
    numericLines.push(trimmed);
  }

  if (numericLines.length < 7) {
    throw new Error("KBM file must include at least 7 numeric lines.");
  }

  const parsed = numericLines.slice(0, 7).map((line, index) => {
    const value = Number.parseFloat(line);
    if (!Number.isFinite(value)) {
      throw new Error(`KBM numeric line ${index + 1} is invalid.`);
    }
    return value;
  });

  return {
    mapSize: assertNumber(Math.trunc(parsed[0]), "mapSize"),
    firstMIDInote: assertNumber(Math.trunc(parsed[1]), "firstMIDInote"),
    lastMIDInote: assertNumber(Math.trunc(parsed[2]), "lastMIDInote"),
    middleNote: assertNumber(Math.trunc(parsed[3]), "middleNote"),
    referenceNote: assertNumber(Math.trunc(parsed[4]), "referenceNote"),
    referenceFrequency: assertNumber(parsed[5], "referenceFrequency"),
    octaveDegree: assertNumber(Math.trunc(parsed[6]), "octaveDegree"),
    rawLines
  };
}

export function generateMinimalKbm(rootHz: number, octaveDegree: number): string {
  const lines = [
    "0",
    "0",
    "127",
    "60",
    "69",
    `${rootHz}`,
    `${octaveDegree}`
  ];
  return lines.join("\n") + "\n";
}
