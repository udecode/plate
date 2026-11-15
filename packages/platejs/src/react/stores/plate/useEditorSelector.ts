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
  selector: (editor: Editor) => T,
  options: UseEditorSelectorOptions<T> = {}
): T => {
  const editor = useEditor();

  return useEditorRuntimeState(editor, () => selector(editor), options);
};
