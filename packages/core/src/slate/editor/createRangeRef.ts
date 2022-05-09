import { Editor, Range } from 'slate';
import { TEditor, Value } from './TEditor';

export type CreateRangeRefOptions = Parameters<typeof Editor.rangeRef>[2];

/**
 * Create a mutable ref for a `Range` object, which will stay in sync as new
 * operations are applied to the editor.
 */
export const createRangeRef = <V extends Value>(
  editor: TEditor<V>,
  range: Range,
  options?: CreateRangeRefOptions
) => Editor.rangeRef(editor as any, range, options as any);
