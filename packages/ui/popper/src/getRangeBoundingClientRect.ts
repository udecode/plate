import { toDOMRange } from '@udecode/plate-core/dist/common/slate/react-editor/toDOMRange';
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

  const domRange = toDOMRange(editor, at);
  if (!domRange) return;

  return domRange.getBoundingClientRect();
};
