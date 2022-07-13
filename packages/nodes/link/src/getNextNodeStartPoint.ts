import {
  getNextNode,
  getStartPoint,
  PlateEditor,
  Value,
} from '@udecode/plate-core';
import { Path } from 'slate';

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
