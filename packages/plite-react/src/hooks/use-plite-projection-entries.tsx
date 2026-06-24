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

/** External store that publishes projection entries by runtime id. */
export interface PliteProjectionStore<T = unknown> {
  getSnapshot: () => Readonly<
    Record<string, readonly PliteProjectionEntry<T>[]>
  >;
  getRuntimeSnapshot?: (
    runtimeId: string
  ) => readonly PliteProjectionEntry<T>[];
  subscribeProjectionRefresh?: (
    listener: (result: PliteProjectionRefreshResult) => void
  ) => () => void;
  subscribe: (listener: () => void) => () => void;
  subscribeRuntimeId?: (runtimeId: string, listener: () => void) => () => void;
  subscribeSourceId?: (sourceId: string, listener: () => void) => () => void;
}

const EMPTY_PROJECTIONS = Object.freeze(
  []
) as readonly PliteProjectionEntry<never>[];
const subscribeEmpty = () => () => {};
const getEmptyRuntimeSnapshot = () => EMPTY_PROJECTIONS;

/**
 * Read projection entries for one runtime id from the current projection store.
 *
 * Returns an empty frozen list when no projection store or runtime snapshot is
 * available.
 */
export function usePliteProjectionEntries<T = unknown>(
  runtimeId: string
): readonly PliteProjectionEntry<T>[] {
  const store = useContext(ProjectionContext);
  const subscribe = useCallback(
    (listener: () => void) => {
      if (store?.subscribeRuntimeId) {
        return store.subscribeRuntimeId(runtimeId, listener);
      }

      return store?.subscribe(listener) ?? subscribeEmpty();
    },
    [runtimeId, store]
  );
  const getSnapshot = useCallback(
    () =>
      (store?.getRuntimeSnapshot?.(runtimeId) as
        | readonly PliteProjectionEntry<T>[]
        | undefined) ??
      ((store?.getSnapshot()[runtimeId] as
        | readonly PliteProjectionEntry<T>[]
        | undefined) ||
        EMPTY_PROJECTIONS),
    [runtimeId, store]
  );

  return useSyncExternalStore(
    store ? subscribe : subscribeEmpty,
    store ? getSnapshot : getEmptyRuntimeSnapshot,
    store ? getSnapshot : getEmptyRuntimeSnapshot
  );
}
