import { Editor } from 'slate';

import { TEditor, Value } from './TEditor';

/**
 * Get the set of currently tracked point refs of the editor.
 */
export const getPointRefs = <V extends Value>(editor: TEditor<V>) =>
  Editor.pointRefs(editor as any);
