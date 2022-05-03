import { Path } from 'slate';
import { getEndPoint } from '../../slate/editor/getEndPoint';
import { select } from '../../slate/transforms/select';
import { TEditor, Value } from '../../slate/types/TEditor';
import { getBlockAbove } from '../queries/index';

/**
 * Select the end point of the block above the selection.
 */
export const selectEndOfBlockAboveSelection = <V extends Value>(
  editor: TEditor<V>
) => {
  const path = getBlockAbove(editor)?.[1];

  path && select(editor, getEndPoint(editor, path as Path));
};
