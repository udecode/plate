import { Editor } from 'slate';
import { TEditor, Value } from './TEditor';

export type DeleteForwardOptions = Parameters<typeof Editor.deleteForward>[1];

/**
 * Delete content in the editor forward from the current selection.
 */
export const deleteForward = <V extends Value>(
  editor: TEditor<V>,
  options?: DeleteForwardOptions
) => Editor.deleteForward(editor as any, options);
