import { useRef, useSyncExternalStore } from 'react';
import type { StoreApi } from 'zustand/vanilla';

export function useZustandSelector<TState, TValue>(
  store: StoreApi<TState>,
  selector: (state: TState) => TValue,
  equalityFn: (left: TValue, right: TValue) => boolean = Object.is
) {
  const cache = useRef<{
    selector: (state: TState) => TValue;
    state: TState;
    value: TValue;
  }>(undefined);
  const getSnapshot = () => {
    const state = store.getState();
    const { current } = cache;

    if (current?.selector === selector && Object.is(current.state, state)) {
      return current.value;
    }

    const value = selector(state);

    if (current && equalityFn(current.value, value)) {
      cache.current = { selector, state, value: current.value };
      return current.value;
    }

    cache.current = { selector, state, value };
    return value;
  };

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}
