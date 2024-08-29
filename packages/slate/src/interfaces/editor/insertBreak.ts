import { Editor } from 'slate';

import type { TEditor } from './TEditor';

/**
 * Insert a block break at the current selection.
 *
 * If the selection is currently expanded, it will be deleted first.
 */
export const insertBreak = (editor: TEditor) =>
  Editor.insertBreak(editor as any);
