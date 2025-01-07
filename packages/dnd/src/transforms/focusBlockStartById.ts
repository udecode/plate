import type { Editor } from '@udecode/plate';

/** Select the start of a block by id and focus the editor. */
export const focusBlockStartById = (editor: Editor, id: string) => {
  const path = editor.api.node({ id, at: [] })?.[1];

  if (!path) return;

  editor.tf.select(editor.api.start(path)!);
  editor.tf.focus();
};
