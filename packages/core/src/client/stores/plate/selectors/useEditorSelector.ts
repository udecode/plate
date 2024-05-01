import React from 'react';
import { Value } from '@udecode/slate';
import { selectAtom } from 'jotai/utils';

import { PlateEditor } from '../../../../shared';
import {
  PlateId,
  plateStore,
  UsePlateEditorStoreOptions,
  usePlateSelectors,
} from '../createPlateStore';

export interface UseEditorSelectorOptions<T>
  extends UsePlateEditorStoreOptions {
  id?: PlateId;
  equalityFn?: (a: T, b: T) => boolean;
}

export const useEditorSelector = <
  T,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  selector: (editor: E, prev?: T) => T,
  deps: React.DependencyList,
  {
    id,
    equalityFn = (a: T, b: T) => a === b,
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
