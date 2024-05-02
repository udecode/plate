import type { GetAboveNodeOptions, TEditor, Value } from '@udecode/slate';

import { Path, Range } from 'slate';

import { getBlockAbove } from './getBlockAbove';

/** Whether the range is in the same block. */
export const isRangeInSameBlock = <V extends Value>(
  editor: TEditor<V>,
  {
    at,
    ...options
  }: { at?: Range | null } & Omit<GetAboveNodeOptions<V>, 'at'> = {}
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

  if (!startBlock || !endBlock) return;

  return Path.equals(startBlock[1], endBlock[1]);
};
