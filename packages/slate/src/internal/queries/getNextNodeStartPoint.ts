import type { Path } from 'slate';

import type { TEditor } from '../interfaces';

/** Get the start point of the next node. */
export const getNextNodeStartPoint = (editor: TEditor, at: Path) => {
  const nextEntry = editor.api.next({ at });

  if (!nextEntry) return;

  return editor.api.start(nextEntry[1]);
};
