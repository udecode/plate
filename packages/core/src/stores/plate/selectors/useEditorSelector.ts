import { DependencyList, useMemo } from 'react';
import { Value } from '@udecode/slate';
import { selectAtom } from 'jotai/utils';

import { PlateEditor } from '../../../types/PlateEditor';
import { PlateId, plateStore, usePlateSelectors } from '../createPlateStore';

export interface UseEditorSelectorOptions<T> {
  id?: PlateId;
  equalityFn?: (a: T, b: T) => boolean;
}

export const useEditorSelector = <
  T,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  selector: (editor: E, prev?: T) => T,
  deps: DependencyList,
  { id, equalityFn = (a: T, b: T) => a === b }: UseEditorSelectorOptions<T> = {}
): T => {
  const selectorAtom = useMemo(
    () =>
      selectAtom<{ editor: E }, T>(
        plateStore.atom.trackedEditor,
        ({ editor }, prev) => selector(editor, prev),
        equalityFn
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );

  return usePlateSelectors(id).atom(selectorAtom);
};
