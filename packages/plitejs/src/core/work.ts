/**
 * The work core does, so a test can check that a key's work follows the edit
 * and not the size of the document it edits.
 *
 * @internal
 */
export type CoreWork = {
  /** Positions mapped between the stored and projected documents. */
  adapterMappings: number;
  /** Sequence nodes built. */
  allocatedNodes: number;
  /** Anchor scopes entered on a projected document. */
  anchorScopes: number;
  /** Projected documents adopted as the schema's validated baseline. */
  baselines: number;
  bookCopies: number;
  /** Change builders started on a projected document. */
  builders: number;
  /** Nodes the canonical pass opened past its check that a node is unchanged. */
  canonicalNodes: number;
  clampWrites: number;
  collapsedBoundaryVisits: number;
  composedProjectionSections: number;
  contentRootOwnerScans: number;
  coverageQueries: number;
  /** Sequence slots copied, each node at its width. */
  copiedSlots: number;
  /** Incremental paths a collaboration binding refused for a fallback. */
  fallbacks: number;
  /** Former-place lookups for a value a node carried into a new place. */
  formerPlaceCalls: number;
  /** Steps, landed nodes and pieces those lookups examined. */
  formerPlaceVisits: number;
  /** Nodes an index was built from, out of a whole array. */
  indexedNodes: number;
  /** Nodes a moved range's landing read to find where its payload stood. */
  landingSources: number;
  /** Bookmarks a step mapped. */
  mappedBookmarks: number;
  /** Plugin update method calls that reached the dispatcher. */
  pluginDispatches: number;
  /** Nodes judged for the values their place can hold. */
  placeChecks: number;
  /** Candidate roots the orphan judge counted owners for. */
  ownedRootsJudged: number;
  /** Roots' ownership indexes the orphan judge fetched. */
  ownerIndexReads: number;
  /** Ownership indexes built from a whole root. */
  ownershipBuilds: number;
  /** Projected roots indexed because the projection gave no index. */
  projectedIndexes: number;
  /** Reads of the whole change from the stored document to the projected. */
  projectionChanges: number;
  /** Roots a collaboration binding reconciled whole by diffing them. */
  reconciles: number;
  /** Runs of tokens a step recorded as relocated from another place. */
  relocations: number;
  /** Nodes a mapping bound as they landed. */
  landedNodeBinds: number;
  /** Root snapshots built from a root's current children. */
  rootSnapshots: number;
  /** Change sections read to map a position or compose a change. */
  sectionsWalked: number;
  /** Snapshot indexes built over a root's children. */
  snapshotIndexes: number;
  /** Whole-root walks a snapshot index made to find a key it lacked. */
  snapshotIndexWalks: number;
  /** Projected roots a frame installs as its snapshot's roots. */
  snapshotRoots: number;
  /** Sequence items a walk visited in order. */
  walkedSlots: number;
  /** Nodes of indexed lists read back as one whole array. */
  wholeReadNodes: number;
  /** Yjs children a collaboration binding enumerated. */
  yjsChildrenRead: number;
  /** Lines the Yjs import's join search read beside a line the batch hid. */
  yjsJoinSiblingsRead: number;
  /** Mark records a collaboration binding visits. */
  yjsMarkRecordsVisited: number;
};

/**
 * The counts themselves, which a sequence bumps in place on its hot path.
 *
 * @internal
 */
export const coreWork: CoreWork = {
  adapterMappings: 0,
  allocatedNodes: 0,
  anchorScopes: 0,
  baselines: 0,
  bookCopies: 0,
  builders: 0,
  canonicalNodes: 0,
  clampWrites: 0,
  collapsedBoundaryVisits: 0,
  composedProjectionSections: 0,
  contentRootOwnerScans: 0,
  coverageQueries: 0,
  copiedSlots: 0,
  fallbacks: 0,
  formerPlaceCalls: 0,
  formerPlaceVisits: 0,
  indexedNodes: 0,
  landingSources: 0,
  mappedBookmarks: 0,
  pluginDispatches: 0,
  placeChecks: 0,
  ownedRootsJudged: 0,
  ownerIndexReads: 0,
  ownershipBuilds: 0,
  projectedIndexes: 0,
  projectionChanges: 0,
  reconciles: 0,
  relocations: 0,
  landedNodeBinds: 0,
  rootSnapshots: 0,
  sectionsWalked: 0,
  snapshotIndexes: 0,
  snapshotIndexWalks: 0,
  snapshotRoots: 0,
  walkedSlots: 0,
  wholeReadNodes: 0,
  yjsChildrenRead: 0,
  yjsJoinSiblingsRead: 0,
  yjsMarkRecordsVisited: 0,
};

/** @internal */
export const countCoreWork = (kind: keyof CoreWork, amount = 1) => {
  coreWork[kind] += amount;
};

/** @internal */
export const readCoreWork = (): Readonly<CoreWork> => ({ ...coreWork });

/** @internal */
export const resetCoreWork = () => {
  for (const kind of Object.keys(coreWork) as Array<keyof CoreWork>) {
    coreWork[kind] = 0;
  }
};

/** @internal */
export const restoreCoreWork = (work: Readonly<CoreWork>) => {
  Object.assign(coreWork, work);
};
