import { Range } from 'slate';
import { ReactEditor } from 'slate-react';
import { Value } from '../../../../slate-utils/src/slate/editor/TEditor';
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
