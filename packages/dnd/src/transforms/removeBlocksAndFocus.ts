import type { BaseEditor } from '@platejs/core';
import type { EditorNodesOptions, ElementIn, ValueOf } from '@platejs/plite';

import { getBlocksWithId } from '../queries/getBlocksWithId';

/** Remove blocks with an id and focus the editor. */
export const removeBlocksAndFocus = <E extends BaseEditor>(
  editor: E,
  options: EditorNodesOptions<ElementIn<ValueOf<E>>>
) => {
  const nodeEntries = getBlocksWithId(editor, options);
  const range = editor.read.ranges.fromEntries(nodeEntries);

  if (!range) return;

  editor.update.nodes.remove({ at: range });
  editor.api.dom.focus();
};
