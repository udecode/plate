import {
  type EditorRuntimeStateSelectorOptions,
  useEditorRuntimeState,
} from '@platejs/plite-react';
import React from 'react';

import type { PlateEditor } from '../../editor';
import { useEditor } from './createPlateStore';

export type UseEditorSelectorOptions<T> = EditorRuntimeStateSelectorOptions<
  T,
  PlateEditor
> & {
  id?: string;
};

export const useEditorSelector = <T>(
  selector: (editor: PlateEditor, prev?: T) => T,
  { id, ...options }: UseEditorSelectorOptions<T> = {}
): T => {
  const editor = useEditor({ id });
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
