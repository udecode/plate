import { useCallback, useContext } from 'react';
import type { RuntimeId } from '@platejs/plite';
import { NodeRuntimeIdContext } from '../context';
import { ProjectionContext } from '../projection-context';
import { useGenericSelector } from './use-generic-selector';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';
import type {
  PliteProjectionEntry,
  PliteProjectionStore,
} from './use-plite-projection-entries';

const refEquality = (a: unknown, b: unknown) => a === b;
const EMPTY_PROJECTIONS = Object.freeze(
  []
) as readonly PliteProjectionEntry<never>[];

/** Data passed to a decoration selector for one rendered runtime. */
export type EditorDecorationSelectorContext<TData = unknown> = {
  projections: readonly PliteProjectionEntry<TData>[];
  runtimeId: RuntimeId | null;
  store: PliteProjectionStore<TData> | null;
};

/** Options that choose which runtime a decoration selector reads. */
export type EditorDecorationSelectorOptions = {
  runtimeId?: RuntimeId | null;
};

const getRuntimeProjections = <TData,>(
  store: PliteProjectionStore<TData> | null,
  runtimeId: RuntimeId | null
) => {
  if (!store || !runtimeId) {
    return EMPTY_PROJECTIONS as readonly PliteProjectionEntry<TData>[];
  }

  return (
    store.getRuntimeSnapshot?.(runtimeId) ??
    store.getSnapshot()[runtimeId] ??
    (EMPTY_PROJECTIONS as readonly PliteProjectionEntry<TData>[])
  );
};

/**
 * Select decoration/projection data for the current rendered runtime.
 *
 * Pass `runtimeId` to target another runtime explicitly. Use this for overlay
 * UI that needs projected ranges without subscribing to the whole editor.
 */
export function useDecorationSelector<TSelected, TData = unknown>(
  selector: (context: EditorDecorationSelectorContext<TData>) => TSelected,
  equalityFn: (a: TSelected | null, b: TSelected) => boolean = refEquality,
  { runtimeId: runtimeIdProp }: EditorDecorationSelectorOptions = {}
): TSelected {
  const store = useContext(
    ProjectionContext
  ) as PliteProjectionStore<TData> | null;
  const contextRuntimeId = useContext(NodeRuntimeIdContext);
  const runtimeId = runtimeIdProp ?? contextRuntimeId;
  const genericSelector = useCallback(
    () =>
      selector({
        projections: getRuntimeProjections(store, runtimeId),
        runtimeId,
        store,
      }),
    [runtimeId, selector, store]
  );
  const [selectedState, update] = useGenericSelector(
    genericSelector,
    equalityFn
  );

  useIsomorphicLayoutEffect(() => {
    if (!store || !runtimeId) {
      update();
      return;
    }

    const unsubscribe = store.subscribeRuntimeId
      ? store.subscribeRuntimeId(runtimeId, update)
      : store.subscribe(update);

    update();

    return unsubscribe;
  }, [runtimeId, store, update]);

  return selectedState;
}
