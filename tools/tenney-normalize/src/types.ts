export type PackDefaults = {
  rootHz: number;
  primeLimit: number;
};

export type PackScaleInput = {
  scala: string;
  kbm?: string;
};

export type PackInputs = {
  scala?: string;
  kbm?: string;
  scales?: PackScaleInput[];
};

export type PackMetadata = {
  slug: string;
  title: string;
  description: string;
  author: string;
  authorUrl?: string;
  license: "CC0-1.0";
  tags: string[];
  defaults: PackDefaults;
  inputs: PackInputs;
  createdAt?: string;
  updatedAt?: string;
};

export type RatioRef = {
  p: number;
  q: number;
  octave: number;
  monzo: Record<string, number>;
};

export type ScaleBuilderPayload = {
  id: string;
  source: "lattice" | "library" | "tuner" | "manual";
  title: string;
  notes: string;
  rootHz: number;
  primeLimit: number;
  refs: RatioRef[];
  axisShift: Record<string, number>;
  autoplayAll: boolean;
  startInLibrary: boolean;
  existing: null;
  stagingBaseCount: null;
  createdAt: string;
  updatedAt: string;
};

export type ScalaDegree =
  | { type: "ratio"; p: number; q: number; source: string }
  | { type: "cents"; cents: number; source: string };

export type ParsedScala = {
  description: string;
  degreeCount: number;
  degrees: ScalaDegree[];
  comments: string[];
};

export type ParsedKbm = {
  mapSize: number;
  firstMIDInote: number;
  lastMIDInote: number;
  middleNote: number;
  referenceNote: number;
  referenceFrequency: number;
  octaveDegree: number;
  rawLines: string[];
};
