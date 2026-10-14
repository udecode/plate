/**
 * The work the review ledger does, so a test can check that a key's work
 * follows the edit and not the document's size.
 *
 * @internal
 */
export type LedgerWork = {
  /** Blocks whose facts were computed, each block object once. */
  blockFacts: number;
  /** Change book entries a sync added to or took from. */
  bookEntries: number;
  /** Composed projection changes built because a reader asked for one. */
  composedChanges: number;
  /** Group lists derived from the book. */
  groups: number;
  /** Nodes inside runs the kernel resolved. */
  resolvedNodes: number;
  /** Runs the kernel resolved. */
  resolvedRuns: number;
  /** Structures rebuilt from a whole root, at load or for a value they share nothing with. */
  rebuilds: number;
  /** Nodes read to compute block facts or to find a window's edges. */
  visitedNodes: number;
  /** Roots resolved whole because no run alone could complete them. */
  wholeResolves: number;
  /** Blocks a sync derived again. */
  windowSlots: number;
};

const work: LedgerWork = {
  blockFacts: 0,
  bookEntries: 0,
  composedChanges: 0,
  groups: 0,
  rebuilds: 0,
  resolvedNodes: 0,
  resolvedRuns: 0,
  visitedNodes: 0,
  wholeResolves: 0,
  windowSlots: 0,
};

/** @internal */
export const countLedgerWork = (kind: keyof LedgerWork, amount = 1) => {
  work[kind] += amount;
};

/** @internal */
export const readLedgerWork = (): Readonly<LedgerWork> => ({ ...work });

/** @internal */
export const resetLedgerWork = () => {
  for (const kind of Object.keys(work) as Array<keyof LedgerWork>) {
    work[kind] = 0;
  }
};
