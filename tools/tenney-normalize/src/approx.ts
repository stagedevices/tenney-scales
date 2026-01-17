import { log2 } from "./utils.js";
import { reduce, isPrimeLimit, ratioToMonzo, tenneyHeight } from "./ratio.js";
import type { Ratio } from "./ratio.js";

export type ApproximationResult = {
  ratio: Ratio;
  errorCents: number;
  height: number;
};

export function approximateCents(cents: number, primeLimit: number): ApproximationResult {
  const target = Math.pow(2, cents / 1200);
  const convergents = convergentsFor(target, 32);
  const candidates: ApproximationResult[] = [];
  const fallback: ApproximationResult[] = [];

  for (const ratio of convergents) {
    const reduced = reduce(ratio.n, ratio.d);
    const centsValue = 1200 * log2(reduced.n / reduced.d);
    const errorCents = Math.abs(centsValue - cents);
    const monzo = ratioToMonzo(reduced);
    const height = tenneyHeight(monzo);
    const result = { ratio: reduced, errorCents, height };
    fallback.push(result);
    if (isPrimeLimit(reduced, primeLimit)) {
      candidates.push(result);
    }
  }

  const pool = candidates.length > 0 ? candidates : fallback;
  if (pool.length === 0) {
    throw new Error("Unable to approximate cents.");
  }

  return pool.sort((a, b) => {
    if (a.errorCents !== b.errorCents) {
      return a.errorCents - b.errorCents;
    }
    return a.height - b.height;
  })[0];
}

function convergentsFor(value: number, maxIterations: number): Ratio[] {
  const continuedFraction: number[] = [];
  let x = value;
  for (let i = 0; i < maxIterations; i += 1) {
    const a = Math.floor(x);
    continuedFraction.push(a);
    const diff = x - a;
    if (Math.abs(diff) < 1e-12) {
      break;
    }
    x = 1 / diff;
  }

  const convergents: Ratio[] = [];
  let n0 = 1;
  let d0 = 0;
  let n1 = continuedFraction[0];
  let d1 = 1;
  convergents.push({ n: n1, d: d1 });

  for (let i = 1; i < continuedFraction.length; i += 1) {
    const a = continuedFraction[i];
    const n2 = a * n1 + n0;
    const d2 = a * d1 + d0;
    convergents.push({ n: n2, d: d2 });
    n0 = n1;
    d0 = d1;
    n1 = n2;
    d1 = d2;
  }

  return convergents;
}
