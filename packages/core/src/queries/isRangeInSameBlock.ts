import { Path, Range } from 'slate';
import { GetAboveNodeOptions, TEditor, Value } from '../slate/index';
import { getBlockAbove } from './getBlockAbove';

export const isRangeInSameBlock = <V extends Value>(
  editor: TEditor<V>,
  {
    at,
    ...options
  }: Omit<GetAboveNodeOptions<V>, 'at'> & { at?: Range | null } = {}
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

  return startBlock && endBlock && Path.equals(startBlock[1], endBlock[1]);
};
