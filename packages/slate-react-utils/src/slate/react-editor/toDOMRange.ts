import { Value } from '@udecode/slate-utils/';
import { Range } from 'slate';
import { ReactEditor } from 'slate-react';
import { TReactEditor } from './TReactEditor';

/**
 * {@link ReactEditor.toDOMRange}
 */
export const toDOMRange = <V extends Value>(
  editor: TReactEditor<V>,
  range: Range
) => {
  try {
    return ReactEditor.toDOMRange(editor as any, range);
  } catch (e) {}
};
