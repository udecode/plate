import type { Path } from 'slate';

import { type TEditor, getEndPoint, select } from '@udecode/slate';

import { getBlockAbove } from '../queries';

/** Select the end point of the block above the selection. */
export const selectEndOfBlockAboveSelection = (editor: TEditor) => {
  const path = getBlockAbove(editor)?.[1];

  path && select(editor, getEndPoint(editor, path as Path));
};
