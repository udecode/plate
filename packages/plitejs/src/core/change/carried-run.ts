import {
  type DocumentChange,
  getInternalDocumentRootChange,
} from './document-change';
import type { DocumentIndex } from './document-index';
import { jsonEqual } from './json';
import { keptRunsOf, type RootChange } from './root-change';

/**
 * Tokens a change deletes at `source` in its input and inserts, the same
 * tokens, at `at` in its output. A merge into a nested line carries the
 * joined line's content across the closing tokens of the line it joins, so an
 * edit inside the run belongs to that content wherever it stands.
 */
export type CarriedRun = Readonly<{
  at: number;
  length: number;
  root: string;
  source: number;
}>;

/**
 * The run a node move carries when it lands the node earlier in the document
 * across closing tokens only, so the node joins the subtree those tokens
 * close.
 *
 * @internal
 */
export const carriedRunOfMove = (
  root: string,
  document: DocumentIndex,
  range: Readonly<{ from: number; to: number }>,
  move: RootChange
): readonly CarriedRun[] => {
  // A move inserts its node first when it lands it earlier.
  const [target, targetInserted, removed, inserted] = move.sections;

  if (
    targetInserted !== -1 ||
    removed !== 0 ||
    inserted !== range.to - range.from ||
    target >= range.from ||
    // Each close the node crosses ends one node open where it lands.
    range.from - target > document.openContextAt(target).length
  ) {
    return [];
  }

  const crossed = document.slice(target, range.from).tokens;

  return crossed.every((token) => token.kind === 'close')
    ? [{ at: target, length: range.to - range.from, root, source: range.from }]
    : [];
};

/**
 * The run as it stands after `change`, from the run in its input: an edit
 * that removes the run's first or last tokens shortens it, and an edit inside
 * it, or one that removes all of it, ends it.
 *
 * @internal
 */
export const mapCarriedRunThrough = (
  run: CarriedRun,
  change: RootChange
): CarriedRun | null => {
  let from = run.at;
  let to = run.at + run.length;
  let position = 0;

  for (let index = 0; index < change.sections.length; index += 2) {
    const length = change.sections[index];
    const inserted = change.sections[index + 1];
    const end = position + length;

    if (inserted !== -1 && end > from && position < to) {
      if (inserted === -2 || (position > from && end < to)) return null;
      if (position <= from && end < to) from = end;
      else if (position > from && end >= to) to = position;
      else return null;
    }
    position = end;
  }

  const at = change.mapPos(from, 1);

  return at === null || from >= to
    ? null
    : { ...run, at, length: to - from, source: run.source + from - run.at };
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

/**
 * Whether `change` holds the run as it claims: it deletes the run's source
 * and inserts the same tokens where the run lands.
 *
 * @internal
 */
export const carriesRun = (
  change: RootChange,
  before: DocumentIndex,
  after: DocumentIndex,
  run: CarriedRun
) => {
  if (
    run.length === 0 ||
    !deletes(change, run.source, run.source + run.length) ||
    keptRunsOf(change, run.at, run.at + run.length).length > 0
  ) {
    return false;
  }

  const source = before.slice(run.source, run.source + run.length).toJSON();
  const landed = after.slice(run.at, run.at + run.length).toJSON();

  return jsonEqual(source, landed);
};

/**
 * The runs whose landing `change` leaves whole, each moved to where it
 * stands after `change`; undefined when none is left.
 *
 * @internal
 */
export const landCarriedRuns = (
  runs: readonly CarriedRun[],
  change: DocumentChange
) => {
  const landed = runs.flatMap((run) => {
    const rootChange = getInternalDocumentRootChange(change, run.root);

    if (!rootChange) return [run];

    const moved = mapCarriedRunThrough(run, rootChange);

    return moved?.length === run.length ? [{ ...run, at: moved.at }] : [];
  });

  return landed.length > 0 ? landed : undefined;
};

/** The run the inverse of a change that carries `run` carries. @internal */
export const invertCarriedRun = (run: CarriedRun): CarriedRun => ({
  at: run.source,
  length: run.length,
  root: run.root,
  source: run.at,
});
