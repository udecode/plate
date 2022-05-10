import { Path } from 'slate';
import { getEndPoint } from '../../slate/editor/getEndPoint';
import { TEditor, Value } from '../../slate/editor/TEditor';
import { select } from '../../slate/transforms/select';
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
