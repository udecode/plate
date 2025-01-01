import type { Path } from 'slate';

import type { TEditor } from '../interfaces';

/** Get the end point of the previous node. */
export const getPreviousNodeEndPoint = (editor: TEditor, at: Path) => {
  const prevEntry = editor.api.previous({ at });

  if (!prevEntry) return;

  return editor.api.end(prevEntry[1]);
};
