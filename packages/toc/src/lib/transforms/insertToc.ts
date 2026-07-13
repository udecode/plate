import type { BaseEditor } from '@platejs/core';
import type {
  EditorUpdateTransaction,
  Element,
  NodeInsertNodesOptions,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export const insertToc = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  options?: NodeInsertNodesOptions<Element>
) => {
  tx.nodes.insert(
    {
      children: [{ text: '' }],
      type: editor.getType(KEYS.toc),
    },
    options
  );
};
