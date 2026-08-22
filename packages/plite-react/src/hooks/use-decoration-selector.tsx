import type { NodeKey } from '@platejs/plite';
import { useCallback, useContext } from 'react';

import { NodeKeyContext } from '../context';
import { ProjectionContext } from '../projection-context';
import { useGenericSelector } from './use-generic-selector';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';
import type {
  PliteProjectionEntry,
  PliteProjectionStore,
} from './use-plite-projection-entries';

const refEquality = (a: unknown, b: unknown) => a === b;
const EMPTY_PROJECTIONS = Object.freeze([]) as ReadonlyArray<
  PliteProjectionEntry<never>
>;

/** Data passed to a decoration selector for one rendered runtime. */
export type EditorDecorationSelectorContext<TData = unknown> = {
  projections: ReadonlyArray<PliteProjectionEntry<TData>>;
  nodeKey: NodeKey | null;
  store: PliteProjectionStore<TData> | null;
};

/** Options that choose which runtime a decoration selector reads. */
export type EditorDecorationSelectorOptions = {
  nodeKey?: NodeKey | null;
};

const getRuntimeProjections = <TData,>(
  store: PliteProjectionStore<TData> | null,
  nodeKey: NodeKey | null
) => {
  if (!store || !nodeKey) {
    return EMPTY_PROJECTIONS as ReadonlyArray<PliteProjectionEntry<TData>>;
  }

  return (
    store.getRuntimeSnapshot?.(nodeKey) ??
    store.getSnapshot()[nodeKey] ??
    EMPTY_PROJECTIONS
  );
};

/**
 * Select decoration/projection data for the current rendered runtime.
 *
 * Pass `nodeKey` to target another runtime explicitly. Use this for overlay
 * UI that needs projected ranges without subscribing to the whole editor.
 */
export function useDecorationSelector<TSelected, TData = unknown>(
  selector: (context: EditorDecorationSelectorContext<TData>) => TSelected,
  equalityFn: (a: TSelected | null, b: TSelected) => boolean = refEquality,
  { nodeKey: nodeKeyProp }: EditorDecorationSelectorOptions = {}
): TSelected {
  const store = useContext(
    ProjectionContext
  ) as PliteProjectionStore<TData> | null;
  const contextNodeKey = useContext(NodeKeyContext);
  const nodeKey = nodeKeyProp ?? contextNodeKey;
  const genericSelector = useCallback(
    () =>
      selector({
        projections: getRuntimeProjections(store, nodeKey),
        nodeKey,
        store,
      }),
    [nodeKey, selector, store]
  );
  const [selectedState, update] = useGenericSelector(
    genericSelector,
    equalityFn
  );

  useIsomorphicLayoutEffect(() => {
    if (!store || !nodeKey) {
      update();
      return undefined;
    }

    const unsubscribe = store.subscribeNodeKey
      ? store.subscribeNodeKey(nodeKey, update)
      : store.subscribe(update);

    update();

    return unsubscribe;
  }, [nodeKey, store, update]);

  return selectedState;
}
