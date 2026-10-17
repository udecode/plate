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
  /** Change builders started on a projected document. */
  builders: number;
  composedProjectionSections: number;
  /** Sequence slots copied, each node at its width. */
  copiedSlots: number;
  /** Incremental paths a collaboration binding refused for a fallback. */
  fallbacks: number;
  /** Nodes an index was built from, out of a whole array. */
  indexedNodes: number;
  /** Projected roots indexed because the projection gave no index. */
  projectedIndexes: number;
  /** Reads of the whole change from the stored document to the projected. */
  projectionChanges: number;
  /** Roots a collaboration binding reconciled whole by diffing them. */
  reconciles: number;
  /** Change sections read to map a position or compose a change. */
  sectionsWalked: number;
  /** Projected roots a frame installs as its snapshot's roots. */
  snapshotRoots: number;
  /** Sequence items a walk visited in order. */
  walkedSlots: number;
  /** Nodes of indexed lists read back as one whole array. */
  wholeReadNodes: number;
  /** Yjs children a collaboration binding enumerated. */
  yjsChildrenRead: number;
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
  builders: 0,
  composedProjectionSections: 0,
  copiedSlots: 0,
  fallbacks: 0,
  indexedNodes: 0,
  projectedIndexes: 0,
  projectionChanges: 0,
  reconciles: 0,
  sectionsWalked: 0,
  snapshotRoots: 0,
  walkedSlots: 0,
  wholeReadNodes: 0,
  yjsChildrenRead: 0,
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
