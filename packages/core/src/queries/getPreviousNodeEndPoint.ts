import { Path } from 'slate';
import { getEndPoint, getPreviousNode, Value } from '../slate';
import { PlateEditor } from '../types/index';

/**
 * Get the end point of the previous node.
 */
export const getPreviousNodeEndPoint = <V extends Value = Value>(
  editor: PlateEditor<V>,
  at: Path
) => {
  const prevEntry = getPreviousNode(editor, {
    at,
  });
  if (!prevEntry) return;

  return getEndPoint(editor, prevEntry[1]);
};
