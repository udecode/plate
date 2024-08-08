import { Editor } from 'slate';

import type { TEditor } from './TEditor';

/**
 * Add a custom property to the leaf text nodes in the current selection.
 *
 * If the selection is currently collapsed, the marks will be added to the
 * `editor.marks` property instead, and applied when text is inserted next.
 */
export const addMark = (editor: TEditor, key: string, value: any) =>
  Editor.addMark(editor as any, key, value);
