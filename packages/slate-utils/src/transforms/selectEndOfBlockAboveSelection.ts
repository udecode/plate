import { getEndPoint, select, TEditor, Value } from '@udecode/slate';
import { Path } from 'slate';
import { getBlockAbove } from '../queries';

/**
 * Select the end point of the block above the selection.
 */
export const selectEndOfBlockAboveSelection = <V extends Value>(
  editor: TEditor<V>
) => {
  const path = getBlockAbove(editor)?.[1];

  path && select(editor, getEndPoint(editor, path as Path));
};
