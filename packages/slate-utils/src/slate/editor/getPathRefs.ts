import { Editor } from 'slate';
import { TEditor, Value } from './TEditor';

/**
 * Get the set of currently tracked path refs of the editor.
 */
export const getPathRefs = <V extends Value>(editor: TEditor<V>) =>
  Editor.pathRefs(editor as any);
