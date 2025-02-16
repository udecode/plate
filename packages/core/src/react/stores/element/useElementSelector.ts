import React from 'react';

import type { NodeEntry, TElement } from '@udecode/slate';

import { useStoreAtomValue } from 'jotai-x';
import { selectAtom } from 'jotai/utils';

import { elementStore, useElementStore } from './useElementStore';

interface UseElementSelectorOptions<T> {
  key?: string;
  equalityFn?: (a: T, b: T) => boolean;
}

export const useElementSelector = <T>(
  selector: <N extends TElement>(state: NodeEntry<N>, prev?: T) => T,
  deps: React.DependencyList,
  {
    key,
    equalityFn = (a: T, b: T) => a === b,
  }: UseElementSelectorOptions<T> = {}
): T => {
  const selectorAtom = React.useMemo(
    () =>
      selectAtom(
        elementStore.atom.entry,
        (entry, prev) => selector(entry, prev),
        equalityFn
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );

  return useStoreAtomValue(useElementStore(key), selectorAtom);
};
