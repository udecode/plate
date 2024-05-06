import type { Path } from 'slate';

import {
  type TEditor,
  type Value,
  getEndPoint,
  getPreviousNode,
} from '@udecode/slate';

/** Get the end point of the previous node. */
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
