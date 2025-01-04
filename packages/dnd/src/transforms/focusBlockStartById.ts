import type { TEditor } from '@udecode/plate-common';

/** Select the start of a block by id and focus the editor. */
export const focusBlockStartById = (editor: TEditor, id: string) => {
  const path = editor.api.find({ at: [], match: { id } })?.[1];

  if (!path) return;

  editor.tf.select(editor.api.start(path)!);
  editor.tf.focus();
};
