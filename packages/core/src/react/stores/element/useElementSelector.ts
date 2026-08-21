import type { Element, NodeEntry } from '@platejs/plite';
import React from 'react';

import type {
  PlateElementDescriptor,
  PlateElementForDescriptor,
} from './useElement';
import { useElementStoreContext } from './useElementStore';

type UseElementSelectorOptions<T> = {
  equalityFn?: (a: T, b: T) => boolean;
  /** Low-level provider scope. Prefer passing a plugin descriptor. */
  scope?: string;
};

type ElementSelector<N extends Element, T> = (
  state: NodeEntry<N>,
  prev?: T
) => T;

export function useElementSelector<T>(
  selector: ElementSelector<Element, T>,
  options?: UseElementSelectorOptions<T>
): T;
export function useElementSelector<
  const TPlugin extends PlateElementDescriptor,
  T,
>(
  plugin: TPlugin,
  selector: ElementSelector<PlateElementForDescriptor<TPlugin>, T>,
  options?: Omit<UseElementSelectorOptions<T>, 'scope'>
): T;
export function useElementSelector<T>(
  pluginOrSelector: PlateElementDescriptor | ElementSelector<Element, T>,
  selectorOrOptions?:
    | ElementSelector<Element, T>
    | UseElementSelectorOptions<T>,
  pluginOptions: Omit<UseElementSelectorOptions<T>, 'scope'> = {}
): T {
  const plugin =
    typeof pluginOrSelector === 'function' ? undefined : pluginOrSelector;
  const selector = (
    typeof pluginOrSelector === 'function'
      ? pluginOrSelector
      : selectorOrOptions
  ) as ElementSelector<Element, T>;
  const options = (
    typeof pluginOrSelector === 'function' ? selectorOrOptions : pluginOptions
  ) as UseElementSelectorOptions<T> | undefined;
  const equalityFn = options?.equalityFn ?? ((a: T, b: T) => a === b);
  const context = useElementStoreContext(plugin?.name ?? options?.scope);
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
}
