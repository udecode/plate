import type { Path } from 'slate';

import type { TEditor } from '../interfaces';

/** Select the end point of the block above the selection. */
export const selectEndOfBlockAboveSelection = (editor: TEditor) => {
  const path = editor.api.above()?.[1];

  path && editor.tf.select(editor.api.end(path as Path)!);
};
