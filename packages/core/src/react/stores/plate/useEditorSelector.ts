import React from 'react';

import {
  type EditorRuntimeStateSelectorOptions,
  useEditorRuntimeState,
} from '@platejs/plite-react';

import { useEditor } from './createPlateStore';
import type { PlateStoreEditor } from './PlateStore';

export type UseEditorSelectorOptions<
  T,
  E extends PlateStoreEditor = PlateStoreEditor,
> = EditorRuntimeStateSelectorOptions<T, E> & {
  id?: string;
};

export const useEditorSelector = <
  T,
  E extends PlateStoreEditor = PlateStoreEditor,
>(
  selector: (editor: E, prev?: T) => T,
  { id, ...options }: UseEditorSelectorOptions<T, E> = {}
): T => {
  const editor = useEditor<E>({ id });
  const previousValueRef = React.useRef<T | undefined>(undefined);

  return useEditorRuntimeState(
    editor,
    () => {
      const nextValue = selector(editor, previousValueRef.current);

      previousValueRef.current = nextValue;

      return nextValue;
    },
    options
  );
};
