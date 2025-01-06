import type { Editor } from '../interfaces';
import type { Path } from '../interfaces/path';

/** Select the end point of the block above the selection. */
export const selectEndOfBlockAboveSelection = (editor: Editor) => {
  const path = editor.api.above()?.[1];

  path && editor.tf.select(editor.api.end(path as Path)!);
};
