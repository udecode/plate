import React, { type DependencyList } from 'react';
import type { NodeEntry, TElement } from '@platejs/slate';

import { useElementStoreContext } from './useElementStore';

type UseElementSelectorOptions<T> = {
  key?: string;
  equalityFn?: (a: T, b: T) => boolean;
};

export const useElementSelector = <T>(
  selector: <N extends TElement>(state: NodeEntry<N>, prev?: T) => T,
  deps: DependencyList,
  {
    key,
    equalityFn = (a: T, b: T) => a === b,
  }: UseElementSelectorOptions<T> = {}
): T => {
  const context = useElementStoreContext(key);
  const [memoizedSelector, memoizedEqualityFn] = React.useMemo(
    () => [selector, equalityFn],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Caller-provided deps intentionally control selector/equality memoization here.
    deps.length > 0 ? deps : [selector, equalityFn]
  );
  const cacheRef = React.useRef<{
    entry: NodeEntry<any> | null;
    hasValue: boolean;
    runtime:
      | NonNullable<ReturnType<typeof useElementStoreContext>>['runtime']
      | null;
    selector: (<N extends TElement>(state: NodeEntry<N>, prev?: T) => T) | null;
    value: T | undefined;
  }>({
    entry: null,
    hasValue: false,
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

    if (cache.runtime !== runtime || cache.selector !== memoizedSelector) {
      cache.entry = null;
      cache.hasValue = false;
      cache.runtime = runtime;
      cache.selector = memoizedSelector;
      cache.value = undefined;
    }

    const entry = runtime?.getState().entry ?? null;

    if (cache.entry === entry && cache.hasValue) {
      return cache.value as T;
    }

    if (!entry) {
      cache.entry = null;
      cache.hasValue = false;
      cache.value = undefined;

      return undefined as T;
    }

    const nextValue = memoizedSelector(
      entry,
      cache.hasValue ? cache.value : undefined
    );

    if (cache.hasValue && memoizedEqualityFn(cache.value as T, nextValue)) {
      cache.entry = entry;

      return cache.value as T;
    }

    cache.entry = entry;
    cache.hasValue = true;
    cache.value = nextValue;

    return nextValue;
  }, [context, memoizedEqualityFn, memoizedSelector]);

  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};
