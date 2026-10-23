import type { JsonNode } from '../../core/change/tokens';

/**
 * The work the review ledger does, so a test can check that a key's work
 * follows the edit and not the document's size.
 *
 * @internal
 */
export type LedgerWork = {
  /**
   * Preview selections a commit mapped through a projection built apart
   * from its mode, because no view read the selection the mode last showed.
   */
  apartSelections: number;
  blockFacts: number;
  bookEntries: number;
  /** Ordered runs `orderedRunsIn` yielded. */
  breakRuns: number;
  /** Pairs of neighboring changes the card sequence checked for touching. */
  cardPairs: number;
  /** Card summaries `cardIn` built. */
  cardSummaries: number;
  /** Card members publication walked after a member's card id changed. */
  cardWalks: number;
  /** Deletion, join and follower keys a block's facts folded, its own and its children's. */
  claimKeys: number;
  /** Nodes the gate read to tell a write it shows reordered from one it changed. */
  classifiedNodes: number;
  /** Blocks compared between a resolved window and the frame's write. */
  comparedBlocks: number;
  /** Nodes compared between a resolved window and the frame's write. */
  comparedNodes: number;
  composedChanges: number;
  /** Context records followed to list a context's members. */
  contextHops: number;
  contextsMinted: number;
  diffedCommits: number;
  /** Nodes of the shown blocks and of the output a level diffed. */
  diffedNodes: number;
  /** Review facts built for a document. */
  documentFacts: number;
  /** Card entries `walkEntries` yielded. */
  entriesScanned: number;
  /** Nodes read to build the facts of a block, by `blockFactsOf` or a level. */
  factNodes: number;
  /** Runs that fill a root's minimum; a container's own minimum does not count. */
  filledRuns: number;
  headRuns: number;
  /** Holders of a change read to place it, summarize it or list its sites. */
  holderReads: number;
  /** Blocks the output hides whole, or merged runs of them, that a place read looked at. */
  hiddenBlocks: number;
  /** Insertion counts admission copied or rewound to admit a commit. */
  insertionCounts: number;
  /** Text blocks read to find where a join's first block stands. */
  joinScans: number;
  /** Letters of a plain text mapped to find the review texts that hold them. */
  lettersMapped: number;
  /** Levels built for a container's children where none was carried. */
  levelBuilds: number;
  /** Slots the levels inside containers resolved or adopted. */
  levelSlots: number;
  /** Unchanged children read to narrow a commit's changed range inside an element. */
  narrowedChildren: number;
  /** Occurrences a place read looked at in the book. */
  occurrencesVisited: number;
  /** Segments of a run's order that a place read looked at. */
  orderSegments: number;
  /** Blocks a decision compared with the originals they resolve. */
  pairedBlocks: number;
  /** Pair reads a book sync made, one for each side of each block it compared. */
  pairsCompared: number;
  /** Maps from a run's stored places to its output's that were built. */
  placesBuilt: number;
  /** Stored sites a publication mapped through a preview's places. */
  previewSites: number;
  resolvedNodes: number;
  resolvedRuns: number;
  rebuilds: number;
  /** Nodes the settle pass read. */
  settledNodes: number;
  /** Slots a level read to map a projected range to its stored ranges. */
  spanSlots: number;
  /** Blocks a decision read on both sides of what it replaced, to find changes it strands. */
  strandedBlocks: number;
  /** Children read to sum an element's insertions or find a stacked context in it. */
  summaryChildren: number;
  /** Children read to tell a text block from a container. */
  textScans: number;
  /** Resolved runs whose output no alignment paired, so a diff maps them. */
  unalignedRuns: number;
  /** Verdict lookups, whether or not the document holds any verdict. */
  verdictLookups: number;
  visitedNodes: number;
  /** Containers a window resolved or adopted whole instead of through a level. */
  wholeContainers: number;
  windowSlots: number;
  writtenNodes: number;
  writtenRuns: number;
};

const work: LedgerWork = {
  apartSelections: 0,
  blockFacts: 0,
  bookEntries: 0,
  breakRuns: 0,
  cardPairs: 0,
  cardSummaries: 0,
  cardWalks: 0,
  claimKeys: 0,
  classifiedNodes: 0,
  comparedBlocks: 0,
  comparedNodes: 0,
  composedChanges: 0,
  contextHops: 0,
  contextsMinted: 0,
  diffedCommits: 0,
  diffedNodes: 0,
  documentFacts: 0,
  entriesScanned: 0,
  factNodes: 0,
  filledRuns: 0,
  headRuns: 0,
  hiddenBlocks: 0,
  holderReads: 0,
  insertionCounts: 0,
  joinScans: 0,
  lettersMapped: 0,
  levelBuilds: 0,
  levelSlots: 0,
  narrowedChildren: 0,
  occurrencesVisited: 0,
  orderSegments: 0,
  pairedBlocks: 0,
  pairsCompared: 0,
  placesBuilt: 0,
  previewSites: 0,
  rebuilds: 0,
  resolvedNodes: 0,
  resolvedRuns: 0,
  settledNodes: 0,
  spanSlots: 0,
  strandedBlocks: 0,
  summaryChildren: 0,
  textScans: 0,
  unalignedRuns: 0,
  verdictLookups: 0,
  visitedNodes: 0,
  wholeContainers: 0,
  windowSlots: 0,
  writtenNodes: 0,
  writtenRuns: 0,
};

/** @internal */
export const countLedgerWork = (kind: keyof LedgerWork, amount = 1) => {
  work[kind] += amount;
};

/** @internal */
export const nodesIn = (nodes: readonly JsonNode[]): number =>
  nodes.reduce((sum, node) => sum + 1 + nodesIn(node.children ?? []), 0);

/** @internal */
export const readLedgerWork = (): Readonly<LedgerWork> => ({ ...work });

/** A window the gate weighed, and whether it adopted a written run there. */
export type GateWindow = Readonly<{
  adopted: boolean;
  blocks: readonly JsonNode[];
}>;

let gateWindows: GateWindow[] | null = null;

/**
 * Start or stop keeping the stored blocks of each window the gate weighs for
 * the frame's written root, so a law can judge the gate by every block in it.
 *
 * @internal
 */
export const watchGateWindows = (on: boolean) => {
  gateWindows = on ? [] : null;
};

/** @internal */
export const noteGateWindow = (
  blocks: () => readonly JsonNode[],
  adopted: boolean
) => {
  gateWindows?.push({ adopted, blocks: blocks() });
};

/** The windows noted since the last take. @internal */
export const takeGateWindows = (): GateWindow[] => gateWindows?.splice(0) ?? [];

/** @internal */
export const resetLedgerWork = () => {
  for (const kind of Object.keys(work) as Array<keyof LedgerWork>) {
    work[kind] = 0;
  }
};

/** A container's facts a level folded from its children, at its depth. */
export type LevelFacts = Readonly<{
  depth: number;
  facts: unknown;
  node: JsonNode;
}>;

let levelFacts: LevelFacts[] | null = null;

/**
 * Start or stop keeping the facts each level folds for its container, so a
 * law can compare them with the facts a cold read builds.
 *
 * @internal
 */
export const watchLevelFacts = (on: boolean) => {
  levelFacts = on ? [] : null;
};

/** @internal */
export const noteLevelFacts = (
  node: JsonNode,
  facts: unknown,
  depth: number
) => {
  levelFacts?.push({ depth, facts, node });
};

/** The level facts noted since the last take. @internal */
export const takeLevelFacts = (): LevelFacts[] => levelFacts?.splice(0) ?? [];
