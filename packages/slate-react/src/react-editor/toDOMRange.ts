import type { Range } from 'slate';

import { ReactEditor } from 'slate-react';

import type { TReactEditor } from '../types/TReactEditor';

/** {@link ReactEditor.toDOMRange} */
export const toDOMRange = (editor: TReactEditor, range: Range) => {
  try {
    return ReactEditor.toDOMRange(editor as any, range);
  } catch (error) {}
};
