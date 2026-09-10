import React from 'react';

import type { Editor } from '../../editor';
import {
  type EditorRuntimeStateSelectorOptions,
  useEditorRuntimeState,
} from '../../plite-react';
import { useEditor } from './useEditor';

export type UseEditorSelectorOptions<T> = EditorRuntimeStateSelectorOptions<
  T,
  Editor
>;

export const useEditorSelector = <T>(
  selector: (editor: Editor, prev?: T) => T,
  options: UseEditorSelectorOptions<T> = {}
): T => {
  const editor = useEditor();
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
