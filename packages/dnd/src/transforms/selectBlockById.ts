import type { Editor } from '@udecode/plate';

/** Select the block above the selection by id and focus the editor. */
export const selectBlockById = (editor: Editor, id: string) => {
  const path = editor.api.node({ id, at: [] })?.[1];

  if (!path) return;

  editor.tf.select(editor.api.range(path)!);
  editor.tf.focus();
};
