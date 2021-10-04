import { Range } from 'slate';
import { ReactEditor } from 'slate-react';

/**
 * Get bounding client rect by slate range
 */
export const getRangeBoundingClientRect = (
  editor: ReactEditor,
  at: Range | null
) => {
  if (!at) return;

  try {
    const domRange = ReactEditor.toDOMRange(editor, at);
    return domRange.getBoundingClientRect();
  } catch (err) {}
};
