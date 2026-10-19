import React from 'react';

import type {
  ElementStoreState,
  useElementStoreContext,
} from './useElementStore';

export function useElementStoreSelector<K extends 'element' | 'path', T>(
  context: ReturnType<typeof useElementStoreContext>,
  key: K,
  selector: (input: ElementStoreState[K], previous?: T) => T,
  equalityFn: (left: T, right: T) => boolean
): T | undefined {
  const cacheRef = React.useRef<{
    hasValue: boolean;
    input: ElementStoreState[K] | null;
    key: K;
    runtime: NonNullable<typeof context>['runtime'] | null;
    selector: typeof selector | null;
    value: T | undefined;
  }>({
    hasValue: false,
    input: null,
    key,
    runtime: null,
    selector: null,
    value: undefined,
  });
  const subscribe = React.useCallback(
    (onStoreChange: () => void) =>
      context?.runtime.subscribe(onStoreChange) ?? (() => {}),
    [context]
  );
  const getSnapshot = React.useCallback(() => {
    const runtime = context?.runtime ?? null;
    const cache = cacheRef.current;

    if (
      cache.runtime !== runtime ||
      cache.selector !== selector ||
      cache.key !== key
    ) {
      cache.hasValue = false;
      cache.input = null;
      cache.key = key;
      cache.runtime = runtime;
      cache.selector = selector;
      cache.value = undefined;
    }

    const input = runtime?.getState()[key] ?? null;

    if (cache.input === input && cache.hasValue) return cache.value;

    if (!input) {
      cache.hasValue = false;
      cache.input = null;
      cache.value = undefined;

      return undefined;
    }

    const nextValue = selector(input, cache.hasValue ? cache.value : undefined);

    if (cache.hasValue && equalityFn(cache.value as T, nextValue)) {
      cache.input = input;

      return cache.value;
    }

    cache.hasValue = true;
    cache.input = input;
    cache.value = nextValue;

    return nextValue;
  }, [context, equalityFn, key, selector]);

  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
