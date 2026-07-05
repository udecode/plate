import React from 'react';

import { useEditorRuntimeState } from '@platejs/plite-react';

import { useEditorRef } from './createPlateStore';
import type { PlateStoreEditor } from './PlateStore';

export type UseEditorSelectorOptions<T> = {
  id?: string;
  equalityFn?: (a: T | null, b: T) => boolean;
};

export const useEditorSelector = <
  T,
  E extends PlateStoreEditor = PlateStoreEditor,
>(
  selector: (editor: E, prev?: T) => T,
  deps: React.DependencyList,
  { id, equalityFn = (a, b) => a === b }: UseEditorSelectorOptions<T> = {}
): T => {
  const editor = useEditorRef<E>(id);
  const previousValueRef = React.useRef<T | undefined>(undefined);

  return useEditorRuntimeState(
    editor,
    () => {
      const nextValue = selector(editor, previousValueRef.current);

      previousValueRef.current = nextValue;

      return nextValue;
    },
    { deps, equalityFn }
  );
};
