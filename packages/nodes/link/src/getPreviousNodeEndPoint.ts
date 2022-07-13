import {
  getEndPoint,
  getPreviousNode,
  PlateEditor,
  Value,
} from '@udecode/plate-core';
import { Path } from 'slate';

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
