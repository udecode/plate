import React from 'react';
import type { Element, NodeEntry } from '@platejs/plite';

import { useElementStoreContext } from './useElementStore';

type UseElementSelectorOptions<T> = {
  key?: string;
  equalityFn?: (a: T, b: T) => boolean;
};

export const useElementSelector = <T>(
  selector: <N extends Element>(state: NodeEntry<N>, prev?: T) => T,
  {
    key,
    equalityFn = (a: T, b: T) => a === b,
  }: UseElementSelectorOptions<T> = {}
): T => {
  const context = useElementStoreContext(key);
  const cacheRef = React.useRef<{
    entry: NodeEntry<any> | null;
    hasValue: boolean;
    runtime:
      | NonNullable<ReturnType<typeof useElementStoreContext>>['runtime']
      | null;
    selector: (<N extends Element>(state: NodeEntry<N>, prev?: T) => T) | null;
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

    if (cache.runtime !== runtime || cache.selector !== selector) {
      cache.entry = null;
      cache.hasValue = false;
      cache.runtime = runtime;
      cache.selector = selector;
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

    const nextValue = selector(entry, cache.hasValue ? cache.value : undefined);

    if (cache.hasValue && equalityFn(cache.value as T, nextValue)) {
      cache.entry = entry;

      return cache.value as T;
    }

    cache.entry = entry;
    cache.hasValue = true;
    cache.value = nextValue;

    return nextValue;
  }, [context, equalityFn, selector]);

  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};
