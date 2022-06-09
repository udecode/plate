import { Editor } from 'slate';
import { EditorFragmentDeletionOptions } from 'slate/dist/interfaces/editor';
import { TEditor, Value } from './TEditor';

/**
 * Delete the content in the current selection.
 */
export const deleteFragment = <V extends Value>(
  editor: TEditor<V>,
  options?: EditorFragmentDeletionOptions
) => Editor.deleteFragment(editor as any, options);
