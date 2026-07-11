import type { BaseEditor } from '@platejs/core';

/** Select the block above the selection by id and focus the editor. */
export const selectBlockById = <E extends BaseEditor>(
  editor: E,
  id: string
) => {
  const path = editor.read.nodes.find({ at: [], match: { id } })?.[1];

  if (!path) return;

  const range = editor.read.ranges.get(path);

  if (!range) return;

  editor.update.selection.set(range);
  editor.api.dom.focus();
};
