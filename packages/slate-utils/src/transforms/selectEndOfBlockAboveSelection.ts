import type { Path } from 'slate';

import { type TEditor, type Value, getEndPoint, select } from '@udecode/slate';

import { getBlockAbove } from '../queries';

/** Select the end point of the block above the selection. */
export const selectEndOfBlockAboveSelection = <V extends Value>(
  editor: TEditor<V>
) => {
  const path = getBlockAbove(editor)?.[1];

  path && select(editor, getEndPoint(editor, path as Path));
};
