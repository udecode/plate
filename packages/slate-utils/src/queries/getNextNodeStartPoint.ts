import { TEditor, Value, getNextNode, getStartPoint } from '@udecode/slate';
import { Path } from 'slate';

/**
 * Get the start point of the next node.
 */
export const getNextNodeStartPoint = <V extends Value = Value>(
  editor: TEditor<V>,
  at: Path
) => {
  const nextEntry = getNextNode(editor, {
    at,
  });
  if (!nextEntry) return;

  return getStartPoint(editor, nextEntry[1]);
};
