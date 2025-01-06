import type { Editor } from '@udecode/plate-common';

/** Select the block above the selection by id and focus the editor. */
export const selectBlockById = (editor: Editor, id: string) => {
  const path = editor.api.find({ at: [], match: { id } })?.[1];

  if (!path) return;

  editor.tf.select(editor.api.range(path)!);
  editor.tf.focus();
};
