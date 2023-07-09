import { GetAboveNodeOptions, TEditor, Value } from '@udecode/slate';
import { Path, Range } from 'slate';

import { getBlockAbove } from './getBlockAbove';

/**
 * Is the range (default: selection) across blocks.
 * - return undefined if block not found
 * - return boolean whether one of the block is not found, but the other is found
 * - return boolean whether block paths are unequal
 */
export const isRangeAcrossBlocks = <V extends Value>(
  editor: TEditor<V>,
  {
    at,
    ...options
  }: Omit<GetAboveNodeOptions<V>, 'at'> & { at?: Range | null } = {}
) => {
  if (!at) at = editor.selection;
  if (!at) return;

  const [start, end] = Range.edges(at);
  const startBlock = getBlockAbove(editor, {
    at: start,
    ...options,
  });
  const endBlock = getBlockAbove(editor, {
    at: end,
    ...options,
  });

  if (!startBlock && !endBlock) return;

  if (!startBlock || !endBlock) return true;

  return !Path.equals(startBlock[1], endBlock[1]);
};
