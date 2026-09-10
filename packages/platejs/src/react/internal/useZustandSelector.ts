import { useCallback } from 'react';
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector';
import type { StoreApi } from 'zustand/vanilla';

const subscribeNoop = () => () => {};
const emptySnapshot = () => null;

type SelectedStoreValue<TState, TValue> =
  | { store: StoreApi<TState>; value: TValue }
  | { store: null; value: null };

export function useZustandSelector<TState, TValue>(
  store: StoreApi<TState>,
  selector: (state: TState) => TValue,
  equalityFn?: (left: TValue, right: TValue) => boolean
): TValue;
export function useZustandSelector<TState, TValue>(
  store: StoreApi<TState> | null | undefined,
  selector: (state: TState) => TValue,
  equalityFn?: (left: TValue, right: TValue) => boolean
): TValue | null;
export function useZustandSelector<TState, TValue>(
  store: StoreApi<TState> | null | undefined,
  selector: (state: TState) => TValue,
  equalityFn: (left: TValue, right: TValue) => boolean = Object.is
) {
  const select = useCallback(
    (state: TState | null): SelectedStoreValue<TState, TValue> =>
      store
        ? { store, value: selector(state as TState) }
        : { store: null, value: null },
    [store, selector]
  );
  const compare = useCallback(
    (
      left: SelectedStoreValue<TState, TValue>,
      right: SelectedStoreValue<TState, TValue>
    ) =>
      left.store === right.store &&
      (!left.store ||
        (right.store !== null && equalityFn(left.value, right.value))),
    [equalityFn]
  );

  return useSyncExternalStoreWithSelector(
    store?.subscribe ?? subscribeNoop,
    store?.getState ?? emptySnapshot,
    store?.getState ?? emptySnapshot,
    select,
    compare
  ).value;
}
