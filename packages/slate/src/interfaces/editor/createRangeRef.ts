import type { EditorRangeRefOptions } from 'slate/dist/interfaces/editor';

import { type Range, Editor } from 'slate';

import type { TEditor } from './TEditor';

/**
 * Create a mutable ref for a `Range` object, which will stay in sync as new
 * operations are applied to the editor.
 */
export const createRangeRef = (
  editor: TEditor,
  range: Range,
  options?: EditorRangeRefOptions
) => Editor.rangeRef(editor as any, range, options as any);
