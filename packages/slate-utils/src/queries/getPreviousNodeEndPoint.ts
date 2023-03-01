import { Path } from 'slate';
import { getEndPoint, getPreviousNode, TEditor, Value } from '../slate';

/**
 * Get the end point of the previous node.
 */
export const getPreviousNodeEndPoint = <V extends Value = Value>(
  editor: TEditor<V>,
  at: Path
) => {
  const prevEntry = getPreviousNode(editor, {
    at,
  });
  if (!prevEntry) return;

  return getEndPoint(editor, prevEntry[1]);
};
