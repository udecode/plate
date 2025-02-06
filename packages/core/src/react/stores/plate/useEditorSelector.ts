import React from 'react';

import { useStoreAtomValue } from 'jotai-x';
import { selectAtom } from 'jotai/utils';

import type { PlateEditor } from '../../editor';

import { plateStore, usePlateStore } from './createPlateStore';

export interface UseEditorSelectorOptions<T> {
  id?: string;
  equalityFn?: (a: T, b: T) => boolean;
}

export const useEditorSelector = <T, E extends PlateEditor = PlateEditor>(
  selector: (editor: E, prev?: T) => T,
  deps: React.DependencyList,
  { id, equalityFn = (a: T, b: T) => a === b }: UseEditorSelectorOptions<T> = {}
): T => {
  const selectorAtom = React.useMemo(
    () =>
      selectAtom<{ editor: E }, T>(
        plateStore.atom.trackedEditor,
        ({ editor }, prev) => selector(editor, prev),
        equalityFn
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );

  return useStoreAtomValue(usePlateStore(id), selectorAtom);
};
