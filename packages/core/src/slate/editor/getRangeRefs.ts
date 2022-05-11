import { Editor } from 'slate';
import { TEditor, Value } from './TEditor';

/**
 * Get the set of currently tracked range refs of the editor.
 */
export const getRangeRefs = <V extends Value>(editor: TEditor<V>) =>
  Editor.rangeRefs(editor as any);
