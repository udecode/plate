import { Editor } from 'slate';

import { TEditor, Value } from './TEditor';

/**
 * Insert a block break at the current selection.
 *
 * If the selection is currently expanded, it will be deleted first.
 */
export const insertBreak = <V extends Value>(editor: TEditor<V>) =>
  Editor.insertBreak(editor as any);
