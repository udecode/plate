import { Path } from 'slate';
import { getNextNode, getStartPoint, Value } from '../slate/index';
import { PlateEditor } from '../types/index';

export const getNextNodeStartPoint = <V extends Value = Value>(
  editor: PlateEditor<V>,
  at: Path
) => {
  const nextEntry = getNextNode(editor, {
    at,
  });
  if (!nextEntry) return;

  return getStartPoint(editor, nextEntry[1]);
};
