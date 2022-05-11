import { Editor } from 'slate';
import { TEditor, Value } from './TEditor';

export type DeleteBackwardOptions = Parameters<typeof Editor.deleteBackward>[1];

/**
 * Delete content in the editor backward from the current selection.
 */
export const deleteBackward = <V extends Value>(
  editor: TEditor<V>,
  options?: DeleteBackwardOptions
) => Editor.deleteBackward(editor as any, options);
