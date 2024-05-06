import React from 'react';

import type { Value } from '@udecode/slate';

import { selectAtom } from 'jotai/utils';

import type { PlateEditor } from '../../../../shared';

import {
  type PlateId,
  type UsePlateEditorStoreOptions,
  plateStore,
  usePlateSelectors,
} from '../createPlateStore';

export interface UseEditorSelectorOptions<T>
  extends UsePlateEditorStoreOptions {
  equalityFn?: (a: T, b: T) => boolean;
  id?: PlateId;
}

export const useEditorSelector = <
  T,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
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
