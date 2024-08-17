import React from 'react';

import { selectAtom } from 'jotai/utils';

import type { PlateEditor } from '../../../plugin/PlateEditor';

import {
  type UsePlateEditorStoreOptions,
  plateStore,
  usePlateSelectors,
} from '../createPlateStore';

export interface UseEditorSelectorOptions<T>
  extends UsePlateEditorStoreOptions {
  equalityFn?: (a: T, b: T) => boolean;
  id?: string;
}

export const useEditorSelector = <T, E extends PlateEditor = PlateEditor>(
  selector: (editor: E, prev?: T) => T,
  deps: React.DependencyList,
  {
    equalityFn = (a: T, b: T) => a === b,
    id,
    ...storeOptions
  }: UseEditorSelectorOptions<T> = {}
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

  return usePlateSelectors(id, {
    debugHookName: 'useEditorSelector',
    ...storeOptions,
  }).atom(selectorAtom);
};
