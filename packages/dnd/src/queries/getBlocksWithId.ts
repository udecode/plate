import type { BaseEditor } from '@platejs/core';
import type { EditorNodesOptions, ElementIn, ValueOf } from '@platejs/plite';

/** Get blocks with an id */
export const getBlocksWithId = <E extends BaseEditor>(
  editor: E,
  options: EditorNodesOptions<ElementIn<ValueOf<E>>>
) => {
  const nodes = editor.read.nodes.entries<ElementIn<ValueOf<E>>>({
    match: (node, path) =>
      path.length > 0 && editor.read.schema.isBlock(node) && !!node.id,
    ...options,
  });

  return Array.from(nodes);
};
