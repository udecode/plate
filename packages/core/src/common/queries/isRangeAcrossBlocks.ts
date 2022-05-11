import { Path, Range } from 'slate';
import { GetAboveNodeOptions } from '../../slate/editor/getAboveNode';
import { TEditor, Value } from '../../slate/editor/TEditor';
import { getBlockAbove } from './getBlockAbove';

/**
 * Is the range (default: selection) across blocks.
 */
export const isRangeAcrossBlocks = <V extends Value>(
  editor: TEditor<V>,
  {
    at,
    ...options
  }: Omit<GetAboveNodeOptions<V>, 'at' | 'match'> & { at?: Range | null } = {}
) => {
  if (!at) at = editor.selection;
  if (!at) return false;

  const [start, end] = Range.edges(at);
  const startBlock = getBlockAbove(editor, {
    at: start,
    ...options,
  });
  const endBlock = getBlockAbove(editor, {
    at: end,
    ...options,
  });

  return startBlock && endBlock && !Path.equals(startBlock[1], endBlock[1]);
};
