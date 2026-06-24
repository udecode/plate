import type { PlateEditor } from 'platejs/react';

/** Select the block above the selection by id and focus the editor. */
export const selectBlockById = (editor: PlateEditor, id: string) => {
  const path = editor.api.node({ id, at: [] })?.[1];

  if (!path) return;

  editor.update((tx) => {
    tx.selection.set(editor.api.range(path)!);
  });
  editor.api.dom.focus();
};
