import {
  type GetAboveNodeOptions,
  type TEditor,
  type Value,
  isEndPoint,
} from '@udecode/slate';

import { getBlockAbove } from './getBlockAbove';

/** Is the selection focus at the end of its parent block. */
export const isSelectionAtBlockEnd = <V extends Value>(
  editor: TEditor<V>,
  options?: GetAboveNodeOptions<V>
): boolean => {
  const path = getBlockAbove(editor, options)?.[1];

  return !!path && isEndPoint(editor, editor.selection?.focus, path);
};
