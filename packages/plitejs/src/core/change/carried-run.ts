import {
  type DocumentChange,
  getInternalDocumentRootChange,
  valueRootIndex,
} from './document-change';
import type { DocumentIndex } from './document-index';
import { jsonEqual } from './json';
import { isLeafToken, keptRunsOf, RootChange } from './root-change';
import {
  type JsonEditorValue,
  type JsonToken,
  PreparedTokenSlice,
  tokensEqual,
} from './tokens';

/**
 * Tokens a change deletes at `source` in its input and inserts at `at` in its
 * output. The two spans hold the same letters and element tokens in the same
 * order; only the text-leaf tokens around those letters, which carry their
 * marks, may differ, so `length` and `landed` may too. A merge into a nested
 * line, or out of one, carries the joined line's content across the closing
 * tokens of the line it joins and the opening tokens of the elements it
 * leaves, so an edit inside the run belongs to that content wherever it
 * stands.
 */
export type CarriedRun = Readonly<{
  at: number;
  /** How many tokens the run spans where it lands. */
  landed: number;
  /** How many tokens the run spans at its source. */
  length: number;
  root: string;
  source: number;
}>;

declare const exact: unique symbol;

/**
 * A run whose two spans hold the same tokens, which is the only form a
 * projection can copy token for token. Only `exactRunOn` makes one.
 */
export type ExactRun = Readonly<{
  at: number;
  length: number;
  root: string;
  source: number;
}> & { readonly [exact]: true };

/** @internal */
export const widenRun = ({
  at,
  length,
  root,
  source,
}: ExactRun): CarriedRun => ({
  at,
  landed: length,
  length,
  root,
  source,
});

/** @internal */
export const carriedRunOfMove = (
  root: string,
  document: DocumentIndex,
  range: Readonly<{ from: number; to: number }>,
  move: RootChange
): readonly CarriedRun[] => {
  // A move inserts its node first when it lands it earlier.
  const [target, targetInserted, removed, inserted] = move.sections;
  const closable = document.openContextAt(target).length;
  const edges = closable + document.openContextAt(range.from).length;

  if (
    targetInserted !== -1 ||
    removed !== 0 ||
    inserted !== range.to - range.from ||
    target >= range.from ||
    range.from - target > edges
  ) {
    return [];
  }

  const crossed = document.slice(target, range.from).tokens;
  const opens = crossed.findIndex((token) => token.kind !== 'close');
  const closed = opens === -1 ? crossed.length : opens;
  const length = range.to - range.from;

  return closed <= closable &&
    crossed.slice(closed).every((token) => token.kind === 'open')
    ? [{ at: target, landed: length, length, root, source: range.from }]
    : [];
};

const leavesOnly = (tokens: readonly JsonToken[]) => tokens.every(isLeafToken);

/**
 * Whether a section rewrites only text-leaf tokens: it writes the properties
 * of a leaf's open token, or deletes leaf tokens or replaces them with leaf
 * tokens.
 */
const rewritesLeaves = (
  change: RootChange,
  index: number,
  position: number,
  before: DocumentIndex
) => {
  const length = change.sections[index];
  const inserted = change.sections[index + 1];
  const data = change.data[index >> 1];

  if (inserted === -2) {
    return before.slice(position, position + 1).tokens[0]?.kind === 'open'
      ? before.nodeStartingAt(position)?.kind === 'text'
      : false;
  }

  return (
    leavesOnly(before.slice(position, position + length).tokens) &&
    (inserted === 0 ||
      (data instanceof PreparedTokenSlice && leavesOnly(data.tokens)))
  );
};

/**
 * The run as it stands after `change`, from the run in its input. A section
 * that only rewrites text-leaf tokens keeps it, moving an edge past the leaf
 * tokens it rewrites there, when `before`, the change's input, is given to
 * read them. Otherwise an edit that removes the run's first or last tokens
 * shortens it while its spans are one length, and an edit inside it, or one
 * that removes all of it, ends it.
 *
 * @internal
 */
export const mapCarriedRunThrough = (
  run: CarriedRun,
  change: RootChange,
  before?: DocumentIndex
): CarriedRun | null => {
  let from = run.at;
  let to = run.at + run.landed;
  let start: number | null = null;
  let end: number | null = null;
  let position = 0;
  let output = 0;

  for (let index = 0; index < change.sections.length; index += 2) {
    const length = change.sections[index];
    const inserted = change.sections[index + 1];
    const sectionEnd = position + length;
    const outputEnd = output + (inserted < 0 ? length : inserted);
    const reaches =
      inserted !== -1 &&
      (length > 0
        ? sectionEnd > from && position < to
        : position > from && position < to);

    if (reaches && before && rewritesLeaves(change, index, position, before)) {
      if (position <= from) start = outputEnd;
      if (sectionEnd >= to) end = output;
    } else if (reaches) {
      if (inserted === -2 || (position > from && sectionEnd < to)) return null;
      if (run.length !== run.landed) return null;
      if (position <= from && sectionEnd < to) from = sectionEnd;
      else if (position > from && sectionEnd >= to) to = position;
      else return null;
    }
    position = sectionEnd;
    output = outputEnd;
  }

  const at = start ?? change.mapPos(from, 1);
  const landedEnd = end ?? change.mapPos(to, -1);

  if (at === null || landedEnd === null || from >= to || landedEnd <= at) {
    return null;
  }

  const trimmed = from - run.at;

  return {
    ...run,
    at,
    landed: landedEnd - at,
    length: run.length - trimmed - (run.at + run.landed - to),
    source: run.source + trimmed,
  };
};

/**
 * The run after a later step of the draft that carried it, from `before` to
 * `after`. An edge trim of both spans comes first, as the step's sections
 * read; then a rewrite of leaf tokens at the landing's edges; and when the
 * step keeps every letter, as a mark change that types the run's letters
 * again does, the run follows its letters.
 *
 * @internal
 */
export const followCarriedRun = (
  run: CarriedRun,
  change: RootChange,
  before: DocumentIndex,
  after: DocumentIndex
) => {
  const mapped =
    mapCarriedRunThrough(run, change) ??
    mapCarriedRunThrough(run, change, before);

  if (mapped) return mapped;

  const aligned = RootChange.aligned(before, after);

  return aligned ? mapCarriedRunThrough(run, aligned, before) : null;
};

/** Whether `change` deletes every token from `from` to `to`. */
const deletes = (change: RootChange, from: number, to: number) => {
  let position = 0;

  for (let index = 0; index < change.sections.length; index += 2) {
    const end = position + change.sections[index];

    if (change.sections[index + 1] < 0 && end > from && position < to) {
      return false;
    }
    position = end;
  }

  return true;
};

/** A slice's letters and element tokens in order, without its leaf tokens. */
const lettersOf = (slice: PreparedTokenSlice) => {
  const kept: Array<JsonToken | string> = [];

  for (const token of slice.tokens) {
    if (isLeafToken(token)) continue;
    if (token.kind === 'text') {
      const last = kept.at(-1);

      if (typeof last === 'string') kept[kept.length - 1] = last + token.text;
      else kept.push(token.text);
    } else kept.push(token);
  }

  return kept;
};

const sameLetters = (left: PreparedTokenSlice, right: PreparedTokenSlice) => {
  const a = lettersOf(left);
  const b = lettersOf(right);

  return (
    a.length === b.length &&
    a.every((item, index) => {
      const other = b[index];

      return typeof item === 'string' || typeof other === 'string'
        ? item === other
        : tokensEqual(item, other);
    })
  );
};

/**
 * Whether `change` holds the run as it claims: it deletes the run's source
 * and inserts, where the run lands, the same letters and element tokens.
 *
 * @internal
 */
export const carriesRun = (
  change: RootChange,
  before: DocumentIndex,
  after: DocumentIndex,
  run: CarriedRun
) =>
  run.length > 0 &&
  run.landed > 0 &&
  deletes(change, run.source, run.source + run.length) &&
  keptRunsOf(change, run.at, run.at + run.landed).length === 0 &&
  sameLetters(
    before.slice(run.source, run.source + run.length),
    after.slice(run.at, run.at + run.landed)
  );

const withoutEdgeLeaves = (
  document: DocumentIndex,
  from: number,
  to: number
) => {
  const { offsets, tokens } = document.slice(from, to);
  let first = 0;
  let last = tokens.length;

  while (first < last && isLeafToken(tokens[first])) first += 1;
  while (last > first && isLeafToken(tokens[last - 1])) last -= 1;

  return {
    from: from + (offsets[first] ?? to - from),
    to: last === tokens.length ? to : from + offsets[last],
  };
};

/**
 * The run with each span starting and ending at a letter or element token,
 * since the leaf tokens at its ends belong to the leaves around it on each
 * side; null when a span holds no letter or element token.
 *
 * @internal
 */
export const trimRunLeaves = (
  run: CarriedRun,
  before: DocumentIndex,
  after: DocumentIndex
): CarriedRun | null => {
  const source = withoutEdgeLeaves(before, run.source, run.source + run.length);
  const landing = withoutEdgeLeaves(after, run.at, run.at + run.landed);

  return source.to > source.from && landing.to > landing.from
    ? {
        at: landing.from,
        landed: landing.to - landing.from,
        length: source.to - source.from,
        root: run.root,
        source: source.from,
      }
    : null;
};

/**
 * The run `change` carries token for token, from a run it carries by its
 * letters: each span without the leaf tokens at its ends, which must then be
 * the same tokens. Null when they differ, as when a mark on the run's letters
 * differs between its two places.
 *
 * @internal
 */
export const exactRunOn = (
  run: CarriedRun,
  change: RootChange,
  before: DocumentIndex,
  after: DocumentIndex
): ExactRun | null => {
  const trimmed =
    carriesRun(change, before, after, run) && trimRunLeaves(run, before, after);

  return trimmed &&
    trimmed.landed === trimmed.length &&
    jsonEqual(
      before.slice(trimmed.source, trimmed.source + trimmed.length).toJSON(),
      after.slice(trimmed.at, trimmed.at + trimmed.landed).toJSON()
    )
    ? ({
        at: trimmed.at,
        length: trimmed.length,
        root: run.root,
        source: trimmed.source,
      } as ExactRun)
    : null;
};

/**
 * The position of each letter of the run's source in `before` and of the
 * same letter where the run lands in `after`, paired by their order in the
 * run, so a mark change on a carried letter reads as a change to that letter.
 *
 * @internal
 */
export const carriedLetterPairs = (
  run: CarriedRun,
  before: DocumentIndex,
  after: DocumentIndex
) => {
  const lettersAt = (document: DocumentIndex, from: number, length: number) => {
    const positions: number[] = [];
    const { offsets, tokens } = document.slice(from, from + length);

    tokens.forEach((token, index) => {
      if (token.kind !== 'text') return;
      for (let letter = 0; letter < token.text.length; letter++) {
        positions.push(from + offsets[index] + letter);
      }
    });

    return positions;
  };
  const sources = lettersAt(before, run.source, run.length);
  const targets = lettersAt(after, run.at, run.landed);

  return sources.length === targets.length
    ? sources.map((from, index) => ({ from, to: targets[index] }))
    : [];
};

type Pass = Readonly<{
  after: JsonEditorValue;
  before: JsonEditorValue;
  change: DocumentChange;
}>;

/**
 * The runs whose landing each change of `through` leaves whole, each moved
 * to where it stands after the last; undefined when none is left. A change
 * that keeps a root's letters and element tokens moves its runs by those,
 * whatever it deleted and typed again. With `holds`, a run must also be one
 * that change carries.
 *
 * @internal
 */
export const landCarriedRuns = (
  runs: readonly CarriedRun[],
  through: readonly Pass[],
  holds?: Pass
) => {
  const landed = runs.flatMap((run) => {
    let moved: CarriedRun | null = run;

    for (const { after, before, change } of through) {
      const rootChange = getInternalDocumentRootChange(change, run.root);

      if (!moved || !rootChange) continue;

      const from = valueRootIndex(before, run.root);
      const aligned = RootChange.aligned(from, valueRootIndex(after, run.root));
      const next = mapCarriedRunThrough(moved, aligned ?? rootChange, from);

      const keepsSource: boolean = next?.length === moved.length;

      moved = keepsSource ? next : null;
    }
    if (!moved) return [];

    const change =
      holds && getInternalDocumentRootChange(holds.change, run.root);

    return !holds ||
      (change &&
        carriesRun(
          change,
          valueRootIndex(holds.before, run.root),
          valueRootIndex(holds.after, run.root),
          moved
        ))
      ? [moved]
      : [];
  });

  return landed.length > 0 ? landed : undefined;
};

/** The run the inverse of a change that carries `run` carries. @internal */
export const invertCarriedRun = (run: CarriedRun): CarriedRun => ({
  at: run.source,
  landed: run.length,
  length: run.landed,
  root: run.root,
  source: run.at,
});
