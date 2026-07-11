import type { BaseEditor } from '@platejs/core';

/** Select the start of a block by id and focus the editor. */
export const focusBlockStartById = <E extends BaseEditor>(
  editor: E,
  id: string
) => {
  const path = editor.read.nodes.find({ at: [], match: { id } })?.[1];

  if (!path) return;

  const start = editor.read.points.start(path);

  if (!start) return;

  editor.update.selection.set(start);
  editor.api.dom.focus();
};
