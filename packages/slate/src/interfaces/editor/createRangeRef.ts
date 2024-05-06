import type { EditorRangeRefOptions } from 'slate/dist/interfaces/editor';

import { Editor, type Range } from 'slate';

import type { TEditor, Value } from './TEditor';

/**
 * Create a mutable ref for a `Range` object, which will stay in sync as new
 * operations are applied to the editor.
 */
export const createRangeRef = <V extends Value>(
  editor: TEditor<V>,
  range: Range,
  options?: EditorRangeRefOptions
) => Editor.rangeRef(editor as any, range, options as any);
