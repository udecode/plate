import { countCoreWork } from '../work';
import {
  type DocumentChange,
  getInternalDocumentChangeEntries,
  getInternalDocumentRootChange,
} from './document-change';
import type { DocumentIndex } from './document-index';
import {
  type LetterOrigin,
  type LineageStep,
  letterOriginsOf,
  type Relocation,
} from './lineage';

/** Letters `[from, to)` in one root's token positions. */
export type LetterSpan = readonly [from: number, to: number];

/**
 * The letters an author wrote, as sorted spans per root.
 *
 * @internal
 */
export type NewLetters = ReadonlyMap<string, readonly LetterSpan[]>;

/**
 * A committed change's stretches per root, as `letterOriginsOf` labels them.
 *
 * @internal
 */
export type LetterOrigins = ReadonlyMap<string, readonly LetterOrigin[]>;

type MarkedStep = Pick<LineageStep, 'change' | 'relocations'>;

const ORIGINS = new WeakMap<DocumentChange, () => LetterOrigins>();

/**
 * Merge overlapping spans. Touching spans stay apart, so text a recorder keeps
 * between two of them never joins either.
 *
 * @internal
 */
export const mergeSpans = (spans: readonly LetterSpan[]): LetterSpan[] => {
  const merged: Array<[number, number]> = [];

  for (const [from, to] of [...spans].sort((a, b) => a[0] - b[0])) {
    const last = merged.at(-1);

    if (last && from < last[1]) last[1] = Math.max(last[1], to);
    else merged.push([from, to]);
  }

  return merged;
};

/** Keep the parts of each span the sections retain, at their new positions. */
const mapSpans = (
  spans: readonly LetterSpan[],
  sections: readonly number[]
) => {
  const mapped: LetterSpan[] = [];
  let at = 0;
  let fromA = 0;
  let fromB = 0;

  for (
    let index = 0;
    index < sections.length && at < spans.length;
    index += 2
  ) {
    const length = sections[index];
    const inserted = sections[index + 1];
    const toA = fromA + length;

    if (inserted < 0) {
      while (at < spans.length && spans[at][0] < toA) {
        const [from, to] = spans[at];
        const start = Math.max(from, fromA);
        const end = Math.min(to, toA);

        if (start < end) {
          mapped.push([start - fromA + fromB, end - fromA + fromB]);
        }
        if (to > toA) break;
        at += 1;
      }
      fromB += length;
    } else {
      while (at < spans.length && spans[at][1] <= toA) at += 1;
      fromB += inserted;
    }
    fromA = toA;
  }

  return mapped;
};

/** The parts of `spans` that `relocations` landed, at their landed places. */
const relocatedSpans = (
  spans: readonly LetterSpan[],
  relocations: readonly Relocation[],
  root: string
) =>
  relocations.flatMap((run): LetterSpan[] => {
    if (run.root !== root || typeof run.source !== 'number') return [];
    const { source } = run;
    const by = run.at - source;

    return spans.flatMap(([from, to]): LetterSpan[] => {
      const start = Math.max(from, source);
      const end = Math.min(to, source + run.length);

      return start < end ? [[start + by, end + by]] : [];
    });
  });

/**
 * Land `marks`, the new letters of `step`'s before document, in its after
 * document: each root's marks map through its sections and the runs it
 * relocated.
 *
 * @internal
 */
export const landMarks = (
  marks: NewLetters,
  step: MarkedStep
): Map<string, LetterSpan[]> => {
  const landed = new Map<string, LetterSpan[]>();

  for (const [root, spans] of marks) {
    if (step.change.deleteRoots.has(root)) continue;

    const change = getInternalDocumentRootChange(step.change, root);

    countCoreWork('letterMarks', spans.length);
    if (!change) {
      landed.set(root, [...spans]);
      continue;
    }

    const mapped = mergeSpans([
      ...mapSpans(spans, change.sections),
      ...relocatedSpans(spans, step.relocations ?? [], root),
    ]);

    if (mapped.length > 0) landed.set(root, mapped);
  }

  return landed;
};

/**
 * Map each stretch of `letters` by its two ends, its start forward and its end
 * backward. A stretch whose ends do not map, or map to another length, is
 * left out, so its letters read as value.
 *
 * @internal
 */
export const mapNewLetters = (
  letters: NewLetters,
  map: (root: string, position: number, assoc: -1 | 1) => number | null
): Map<string, LetterSpan[]> => {
  const mapped = new Map<string, LetterSpan[]>();

  for (const [root, spans] of letters) {
    const kept = spans.flatMap(([from, to]): LetterSpan[] => {
      const start = map(root, from, 1);
      const end = map(root, to, -1);

      return start !== null && end !== null && end - start === to - from
        ? [[start, end]]
        : [];
    });

    if (kept.length > 0) mapped.set(root, kept);
  }

  return mapped;
};

/**
 * Label each root of a committed change from `steps`, the draft steps behind
 * it, once, on the first read.
 *
 * @internal
 */
export const markLetterOrigins = (
  change: DocumentChange,
  steps: readonly LineageStep[]
) => {
  let pending: readonly LineageStep[] | null = steps;
  let settled: LetterOrigins = new Map();

  ORIGINS.set(change, () => {
    if (pending) {
      const origins = new Map<string, readonly LetterOrigin[]>();

      for (const [root] of getInternalDocumentChangeEntries(change)) {
        if (change.deleteRoots.has(root)) continue;
        const labels = letterOriginsOf(pending, root);

        if (labels) origins.set(root, labels);
      }
      settled = origins;
      pending = null;
    }

    return settled;
  });
};

/**
 * Each root's stretches of a committed change, kept, new or value, sorted by
 * position in its after document. Undefined when the draft that made the
 * change did not track letters.
 *
 * @internal
 */
export const letterOriginsOfChange = (change: DocumentChange) =>
  ORIGINS.get(change)?.();

/** @internal */
export const textSpansIn = (
  document: DocumentIndex,
  from: number,
  to: number
): LetterSpan[] =>
  document.nodeRangesTouching(from, to).flatMap((entry): LetterSpan[] => {
    const start = Math.max(entry.contentFrom, from);
    const end = Math.min(entry.contentTo, to);

    return entry.kind === 'text' && start < end ? [[start, end]] : [];
  });
