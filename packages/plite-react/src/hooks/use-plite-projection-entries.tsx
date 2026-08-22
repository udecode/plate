import type { NodeKey } from '@platejs/plite';
import { useCallback, useContext, useSyncExternalStore } from 'react';

import { ProjectionContext } from '../projection-context';
import type { PliteProjectionRefreshResult } from '../projection-store';

/** Projected range entry for one rendered runtime. */
export interface PliteProjectionEntry<T = unknown> {
  data?: T;
  end: number;
  key: string;
  start: number;
}

/** External store that publishes projection entries by node key. */
export interface PliteProjectionStore<T = unknown> {
  getSnapshot: () => Readonly<
    Record<string, ReadonlyArray<PliteProjectionEntry<T>>>
  >;
  getRuntimeSnapshot?: (
    nodeKey: NodeKey
  ) => ReadonlyArray<PliteProjectionEntry<T>>;
  subscribeProjectionRefresh?: (
    listener: (result: PliteProjectionRefreshResult) => void
  ) => () => void;
  subscribe: (listener: () => void) => () => void;
  subscribeNodeKey?: (nodeKey: NodeKey, listener: () => void) => () => void;
  subscribeSourceId?: (sourceId: string, listener: () => void) => () => void;
}

const EMPTY_PROJECTIONS = Object.freeze([]) as ReadonlyArray<
  PliteProjectionEntry<never>
>;
const subscribeEmpty = () => () => {};
const getEmptyRuntimeSnapshot = () => EMPTY_PROJECTIONS;

/**
 * Read projection entries for one node key from the current projection store.
 *
 * Returns an empty frozen list when no projection store or runtime snapshot is
 * available.
 */
export function usePliteProjectionEntries<T = unknown>(
  nodeKey: NodeKey | null
): ReadonlyArray<PliteProjectionEntry<T>> {
  const store = useContext(ProjectionContext);
  const subscribe = useCallback(
    (listener: () => void) => {
      if (nodeKey && store?.subscribeNodeKey) {
        return store.subscribeNodeKey(nodeKey, listener);
      }

      return store?.subscribe(listener) ?? subscribeEmpty();
    },
    [nodeKey, store]
  );
  const getSnapshot = useCallback(
    () =>
      (nodeKey &&
        (store?.getRuntimeSnapshot?.(nodeKey) as
          | ReadonlyArray<PliteProjectionEntry<T>>
          | undefined)) ??
      ((nodeKey &&
        (store?.getSnapshot()[nodeKey] as
          | ReadonlyArray<PliteProjectionEntry<T>>
          | undefined)) ||
        EMPTY_PROJECTIONS),
    [nodeKey, store]
  );

  return useSyncExternalStore(
    store ? subscribe : subscribeEmpty,
    store ? getSnapshot : getEmptyRuntimeSnapshot,
    store ? getSnapshot : getEmptyRuntimeSnapshot
  );
}
