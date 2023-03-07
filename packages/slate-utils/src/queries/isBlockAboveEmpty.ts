import { TEditor, Value } from '@udecode/slate';
import { getBlockAbove } from './getBlockAbove';
import { isAncestorEmpty } from './isAncestorEmpty';

/**
 * Is the block above the selection empty.
 */
export const isBlockAboveEmpty = <V extends Value>(editor: TEditor<V>) => {
  const block = getBlockAbove(editor)?.[0];
  if (!block) return false;
  return isAncestorEmpty(editor, block);
};
