import { toDOMRange, TReactEditor, Value } from '@udecode/plate-core';
import { Range } from 'slate';

/**
 * Get bounding client rect by slate range
 */
export const getRangeBoundingClientRect = <V extends Value>(
  editor: TReactEditor<V>,
  at: Range | null
) => {
  if (!at) return;

  const domRange = toDOMRange(editor, at);
  if (!domRange) return;

  return domRange.getBoundingClientRect();
};
