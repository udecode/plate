import type { PlateEditor } from 'platejs/react';

/** Select the start of a block by id and focus the editor. */
export const focusBlockStartById = (editor: PlateEditor, id: string) => {
  const path = editor.api.node({ id, at: [] })?.[1];

  if (!path) return;

  editor.update((tx) => {
    tx.selection.set(editor.api.start(path)!);
  });
  editor.api.dom.focus();
};
