import type { Path } from 'slate';

import { type TEditor, getEndPoint, getPreviousNode } from '../interfaces';

/** Get the end point of the previous node. */
export const getPreviousNodeEndPoint = (editor: TEditor, at: Path) => {
  const prevEntry = getPreviousNode(editor, {
    at,
  });

  if (!prevEntry) return;

  return getEndPoint(editor, prevEntry[1]);
};
