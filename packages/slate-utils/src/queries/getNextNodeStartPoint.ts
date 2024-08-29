import type { Path } from 'slate';

import { type TEditor, getNextNode, getStartPoint } from '@udecode/slate';

/** Get the start point of the next node. */
export const getNextNodeStartPoint = (editor: TEditor, at: Path) => {
  const nextEntry = getNextNode(editor, {
    at,
  });

  if (!nextEntry) return;

  return getStartPoint(editor, nextEntry[1]);
};
