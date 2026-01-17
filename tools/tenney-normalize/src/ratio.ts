import { gcd, log2, reduceRatio } from "./utils.js";

export type Ratio = { n: number; d: number };

export function toCents(ratio: Ratio): number {
  return 1200 * log2(ratio.n / ratio.d);
}

export function foldToOctave(ratio: Ratio): { p: number; q: number; octave: number } {
  let n = ratio.n;
  let d = ratio.d;
  let octave = 0;
  while (n >= 2 * d) {
    d *= 2;
    octave += 1;
  }
  while (n < d) {
    n *= 2;
    octave -= 1;
  }
  const reduced = reduceRatio(n, d);
  return { p: reduced.n, q: reduced.d, octave };
}

export function ratioToMonzo(ratio: Ratio): Record<string, number> {
  const numeratorFactors = factorPrime(ratio.n);
  const denominatorFactors = factorPrime(ratio.d);
  const monzo: Record<string, number> = {};
  const primes = new Set([...Object.keys(numeratorFactors), ...Object.keys(denominatorFactors)]);
  for (const prime of primes) {
    const exponent = (numeratorFactors[prime] ?? 0) - (denominatorFactors[prime] ?? 0);
    if (exponent !== 0) {
      monzo[prime] = exponent;
    }
  }
  return monzo;
}

export function ratioToMonzoWithOctave(p: number, q: number, octave: number): Record<string, number> {
  const base = ratioToMonzo({ n: p, d: q });
  if (octave !== 0) {
    const key = "2";
    base[key] = (base[key] ?? 0) + octave;
    if (base[key] === 0) {
      delete base[key];
    }
  }
  return base;
}

export function tenneyHeight(monzo: Record<string, number>): number {
  const exponents = Object.values(monzo);
  if (exponents.length === 0) {
    return 0;
  }
  const sumAbs = exponents.reduce((sum, value) => sum + Math.abs(value), 0);
  const maxAbs = Math.max(...exponents.map((value) => Math.abs(value)));
  return sumAbs + maxAbs;
}

export function isPrimeLimit(ratio: Ratio, primeLimit: number): boolean {
  const numeratorFactors = factorPrime(ratio.n);
  const denominatorFactors = factorPrime(ratio.d);
  const primes = new Set([...Object.keys(numeratorFactors), ...Object.keys(denominatorFactors)]);
  for (const prime of primes) {
    const primeValue = Number.parseInt(prime, 10);
    if (primeValue > primeLimit) {
      return false;
    }
  }
  return true;
}

export function reduce(n: number, d: number): Ratio {
  const reduced = reduceRatio(n, d);
  return { n: reduced.n, d: reduced.d };
}

function factorPrime(value: number): Record<string, number> {
  const factors: Record<string, number> = {};
  let n = Math.abs(value);
  if (n === 1) {
    return factors;
  }
  let divisor = 2;
  while (n > 1 && divisor * divisor <= n) {
    while (n % divisor === 0) {
      const key = `${divisor}`;
      factors[key] = (factors[key] ?? 0) + 1;
      n /= divisor;
    }
    divisor = divisor === 2 ? 3 : divisor + 2;
  }
  if (n > 1) {
    const key = `${n}`;
    factors[key] = (factors[key] ?? 0) + 1;
  }
  return factors;
}

export function compareRatios(a: Ratio, b: Ratio): boolean {
  return a.n === b.n && a.d === b.d;
}

export function lcm(a: number, b: number): number {
  return (a / gcd(a, b)) * b;
}
