import type { PlateEditor } from 'platejs/react';

import {
  type BlocksWithIdOptions,
  getBlocksWithId,
} from '../queries/getBlocksWithId';

/** Remove blocks with an id and focus the editor. */
export const removeBlocksAndFocus = <E extends PlateEditor = PlateEditor>(
  editor: E,
  options: BlocksWithIdOptions<E>
) => {
  const nodeEntries = getBlocksWithId(editor, options);

  editor.update((tx) => {
    tx.nodes.remove({ at: editor.api.nodesRange(nodeEntries) });
  });
  editor.api.dom.focus();
};
