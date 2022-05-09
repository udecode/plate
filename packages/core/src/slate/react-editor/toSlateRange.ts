import { ReactEditor } from 'slate-react';
import { Value } from '../editor/TEditor';
import { TReactEditor } from './TReactEditor';

/**
 * {@link ReactEditor.toSlateRange}
 */
export const toSlateRange = <V extends Value>(
  editor: TReactEditor<V>,
  domRange: Parameters<typeof ReactEditor.toSlateRange>[1],
  options: Parameters<typeof ReactEditor.toSlateRange>[2]
) => {
  try {
    return ReactEditor.toSlateRange(editor as any, domRange, options);
  } catch (e) {}
};
