import { Editor } from 'slate';
import { TEditor, Value } from './TEditor';

export type DeleteFragmentOptions = Parameters<typeof Editor.deleteFragment>[1];

/**
 * Delete the content in the current selection.
 */
export const deleteFragment = <V extends Value>(
  editor: TEditor<V>,
  options?: DeleteFragmentOptions
) => Editor.deleteFragment(editor as any, options);
