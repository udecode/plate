/**
 * The work the review ledger does, so a test can check that a key's work
 * follows the edit and not the document's size.
 *
 * @internal
 */
export type LedgerWork = {
  blockFacts: number;
  bookEntries: number;
  /** Pairs of neighboring changes the card sequence checked for touching. */
  cardPairs: number;
  /** Card members publication walked after a member's card id changed. */
  cardWalks: number;
  composedChanges: number;
  /** Context records followed to list a context's members. */
  contextHops: number;
  contextsMinted: number;
  diffedCommits: number;
  /** Review facts built for a document. */
  documentFacts: number;
  filledRuns: number;
  groups: number;
  headRuns: number;
  resolvedNodes: number;
  resolvedRuns: number;
  rebuilds: number;
  /** Nodes the settle pass read. */
  settledNodes: number;
  /** Verdict lookups, whether or not the document holds any verdict. */
  verdictLookups: number;
  visitedNodes: number;
  windowSlots: number;
  writtenNodes: number;
  writtenRuns: number;
};

const work: LedgerWork = {
  blockFacts: 0,
  bookEntries: 0,
  cardPairs: 0,
  cardWalks: 0,
  composedChanges: 0,
  contextHops: 0,
  contextsMinted: 0,
  diffedCommits: 0,
  documentFacts: 0,
  filledRuns: 0,
  groups: 0,
  headRuns: 0,
  rebuilds: 0,
  resolvedNodes: 0,
  resolvedRuns: 0,
  settledNodes: 0,
  verdictLookups: 0,
  visitedNodes: 0,
  windowSlots: 0,
  writtenNodes: 0,
  writtenRuns: 0,
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
