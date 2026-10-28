import { canonicalJsonKey } from './change/transform';

type Validate = (value: unknown) => boolean;
// A validator's throw is recorded and rethrown on each lookup, so every caller
// meets the throw a fresh call would raise.
type Verdict = boolean | Readonly<{ threw: unknown }>;
export type Verdicts = Map<Validate, Map<string, Verdict>>;

let table: Verdicts | null = null;

const judge = (validate: Validate, value: unknown): Verdict => {
  try {
    return Boolean(validate(value));
  } catch (error) {
    return { threw: error };
  }
};

const replayVerdict = (verdict: Verdict) => {
  if (typeof verdict === 'boolean') return verdict;

  throw verdict.threw;
};

const record = (
  verdicts: Verdicts,
  validate: Validate,
  key: string,
  verdict: Verdict
) => {
  let byKey = verdicts.get(validate);

  if (!byKey) {
    byKey = new Map();
    verdicts.set(validate, byKey);
  }
  byKey.set(key, verdict);
};

export const verdictOf = (validate: Validate, value: unknown): boolean => {
  if (!table) return validate(value);

  const key = canonicalJsonKey(value);
  const known = table.get(validate)?.get(key);

  if (known !== undefined) return replayVerdict(known);

  const verdict = judge(validate, value);

  record(table, validate, key, verdict);

  return replayVerdict(verdict);
};

/**
 * Runs `cover`, which checks every value `read` can meet, then `read` against
 * those verdicts. A nested call shares the outer call's verdicts, and they are
 * dropped when the outermost call returns. A value no cover checked, such as
 * one a generator made, is judged when `read` first meets it and kept for the
 * rest of the run.
 */
export const readingCovered = <T>({
  cover,
  read,
}: Readonly<{ cover: () => void; read: () => T }>): T => {
  const outer = table;

  table ??= new Map();
  try {
    cover();

    return read();
  } finally {
    table = outer;
  }
};

export const judgedBy = (check: () => void): Verdicts => {
  const outer = table;
  const own: Verdicts = new Map();

  table = own;
  try {
    check();
  } finally {
    table = outer;
  }

  return own;
};

export const adoptVerdicts = (verdicts: Verdicts) => {
  if (!table) return;

  for (const [validate, byKey] of verdicts) {
    for (const [key, verdict] of byKey) {
      if (!table.get(validate)?.has(key)) {
        record(table, validate, key, verdict);
      }
    }
  }
};
