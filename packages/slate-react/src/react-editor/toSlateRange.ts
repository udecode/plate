import { ReactEditor } from 'slate-react';

import type { TReactEditor } from '../types/TReactEditor';

/** {@link ReactEditor.toSlateRange} */
export const toSlateRange = (
  editor: TReactEditor,
  domRange: Parameters<typeof ReactEditor.toSlateRange>[1],
  options: Parameters<typeof ReactEditor.toSlateRange>[2]
) => {
  try {
    return ReactEditor.toSlateRange(editor as any, domRange, options);
  } catch (error) {}
};
