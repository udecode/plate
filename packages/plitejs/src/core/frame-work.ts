/**
 * The work a command frame does on the document its commands decide on, per
 * consumer, so a test can check that a key's work follows the edit and not
 * the document's size.
 *
 * @internal
 */
export type FrameWork = {
  /** Positions mapped between the stored and projected documents. */
  adapterMappings: number;
  /** Anchor scopes entered on a projected document. */
  anchorScopes: number;
  /** Projected documents adopted as the schema's validated baseline. */
  baselines: number;
  /** Change builders started on a projected document. */
  builders: number;
  /** Projected roots indexed because the projection gave no index. */
  projectedIndexes: number;
  /** Reads of the whole change from the stored document to the projected. */
  projectionChanges: number;
  /** Projected roots a frame installs as its snapshot's roots. */
  snapshotRoots: number;
};

const work: FrameWork = {
  adapterMappings: 0,
  anchorScopes: 0,
  baselines: 0,
  builders: 0,
  projectedIndexes: 0,
  projectionChanges: 0,
  snapshotRoots: 0,
};

/** @internal */
export const countFrameWork = (kind: keyof FrameWork, amount = 1) => {
  work[kind] += amount;
};

/** @internal */
export const readFrameWork = (): Readonly<FrameWork> => ({ ...work });

/** @internal */
export const resetFrameWork = () => {
  for (const kind of Object.keys(work) as Array<keyof FrameWork>) {
    work[kind] = 0;
  }
};
