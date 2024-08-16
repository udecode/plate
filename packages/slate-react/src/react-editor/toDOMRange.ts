import type { TEditor } from '@udecode/slate';
import type { Range } from 'slate';

import { ReactEditor } from 'slate-react';

/** {@link ReactEditor.toDOMRange} */
export const toDOMRange = (editor: TEditor, range: Range) => {
  try {
    return ReactEditor.toDOMRange(editor as any, range);
  } catch (error) {}
};
