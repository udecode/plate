import React from 'react';

import { sameResult } from '../../../facade';
import type {
  ElementStoreState,
  useElementStoreContext,
} from './useElementStore';

export function useElementStoreSelector<K extends 'element' | 'path', T>(
  context: ReturnType<typeof useElementStoreContext>,
  key: K,
  selector: (input: ElementStoreState[K]) => T,
  equalityFn: (left: T, right: T) => boolean = sameResult
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

    if (cache.runtime !== runtime || cache.key !== key) {
      cache.hasValue = false;
      cache.input = null;
      cache.key = key;
      cache.runtime = runtime;
      cache.selector = null;
      cache.value = undefined;
    }

    const input = runtime?.getState()[key] ?? null;

    if (!input) {
      cache.hasValue = false;
      cache.input = null;
      cache.value = undefined;

      return undefined;
    }
    if (
      cache.hasValue &&
      cache.input === input &&
      cache.selector === selector
    ) {
      return cache.value;
    }

    const nextValue = selector(input);

    cache.input = input;
    cache.selector = selector;

    if (cache.hasValue && equalityFn(cache.value as T, nextValue)) {
      return cache.value;
    }

    cache.hasValue = true;
    cache.value = nextValue;

    return nextValue;
  }, [context, equalityFn, key, selector]);

  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
