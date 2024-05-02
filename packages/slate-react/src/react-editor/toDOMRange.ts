import type { Value } from '@udecode/slate';
import type { Range } from 'slate';

import { ReactEditor } from 'slate-react';

import type { TReactEditor } from '../types/TReactEditor';

/** {@link ReactEditor.toDOMRange} */
export const toDOMRange = <V extends Value>(
  editor: TReactEditor<V>,
  range: Range
) => {
  try {
    return ReactEditor.toDOMRange(editor as any, range);
  } catch (error) {}
};
